import {
  Storage,
  Context,
  generateEvent,
  findCheapestSlot,
  deferredCallCancel,
  deferredCallRegister,
  currentPeriod,
  Slot,
  Address,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { Args, stringToBytes } from '@massalabs/as-types';

export function createPlan(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const planId = args.nextString().expect('Missing planId');
  const planName = args.nextString().expect('Missing planName');
  const description = args.nextString().expect('Missing description');
  const token = args.nextString().expect('Missing token');
  const amount = args.nextString().expect('Missing amount');
  const frequency = args.nextString().expect('Missing frequency');
  const createdAt = args.nextString().expect('Missing createdAt');

  const creator = Context.caller().toString().toLowerCase();

  // Compact delimited format
  const data = `${planName}|${description}|${token}|${amount}|${frequency}|${creator}|${createdAt}`;

  // Save plan data
  Storage.set('plan:' + planId, data);

  // Track plans per creator
  const countKey = 'creatorPlanCount:' + creator;
  const prefix = 'creatorPlan:' + creator + ':';

  // Check if the count key exists before reading
  let count: i32 = 0;
  if (Storage.has(countKey)) {
    const countStr = Storage.get(countKey);
    count = <i32>parseInt(countStr); // explicit cast fixes compile error
  }

  Storage.set(prefix + count.toString(), planId);
  Storage.set(countKey, (count + 1).toString());

  generateEvent('PlanCreated:' + planId);
}

// ------------------ GET ALL PLANS BY CREATOR ------------------

export function getPlansByCreator(args: StaticArray<u8>): StaticArray<u8> {
  const params = new Args(args);
  const creator = params
    .nextString()
    .expect('Missing creator address')
    .toLowerCase();

  const countKey = 'creatorPlanCount:' + creator;
  if (!Storage.has(countKey)) {
    return new StaticArray<u8>(0);
  }

  const count = parseInt(Storage.get(countKey)!);
  const encoded = new Args();

  for (let i = 0; i < count; i++) {
    const planIdKey = 'creatorPlan:' + creator + ':' + i.toString();
    if (!Storage.has(planIdKey)) continue;

    const planId = Storage.get(planIdKey)!;
    const planKey = 'plan:' + planId;
    if (!Storage.has(planKey)) continue;

    const planData = Storage.get(planKey)!;
    const parts = planData.split('|');
    if (parts.length < 7) continue;

    const planName = parts[0];
    const amount = parts[3];
    const frequency = parts[4];

    encoded
      .add(planId)
      .add(planName)
      .add(frequency)
      .add(0 as u32) // Placeholder
      .add(amount);
  }

  return encoded.serialize();
}

// ------------------ GET PLAN BY ID ------------------

export function getPlanById(args: StaticArray<u8>): StaticArray<u8> {
  const params = new Args(args);
  const planId = params.nextString().expect('Missing planId');

  const key = 'plan:' + planId;
  if (!Storage.has(key)) {
    return new StaticArray<u8>(0);
  }

  const planData = Storage.get(key);
  if (planData === null) {
    return new StaticArray<u8>(0);
  }

  const parts = planData.split('|');
  if (parts.length < 7) {
    return new StaticArray<u8>(0);
  }

  const encoded = new Args()
    .add(parts[0]) // name
    .add(parts[1]) // description
    .add(parts[2]) // token
    .add(parts[3]) // amount
    .add(parts[4]) // frequency
    .add(parts[5]) // creator
    .add(parts[6]); // createdAt

  return encoded.serialize();
}

// ------------------ RECURRING BILLING HELPERS ------------------

// Map plan frequency string to a rough period offset.
// Tune values based on real chain timing if needed.
function frequencyToPeriodOffset(freq: string): u64 {
  const f = freq.toLowerCase();

  if (f == 'daily') return 200; // stable
  if (f == 'weekly') return 1400; // stable
  if (f == 'monthly') return 6000; // safe & widely used

  return 200;
}

function deferredStorageKey(planId: string, subscriber: string): string {
  return 'deferred:' + planId + ':' + subscriber.toLowerCase();
}

/**
 * Compute the next billing Slot using findCheapestSlot from the SDK.
 * Uses a window [currentPeriod + offset, currentPeriod + offset + 20].
 */
function computeNextBillingSlot(frequency: string): Slot {
  const offset: u64 = frequencyToPeriodOffset(frequency);
  const current: u64 = currentPeriod();

  const start: u64 = current + offset;
  const end: u64 = start + 200; // larger safe buffer

  const maxGas: u64 = 3_000_000; // reduced – safer

  let slot = findCheapestSlot(start, end, maxGas, 0);

  // safety fallback
  if (slot.period <= current) {
    slot = new Slot(current + 200, 0);
  }

  return slot;
}

/**
 * Schedule the next recurring payment for (planId, subscriber)
 * using deferredCallRegister to call processRecurringPayment.
 */
function scheduleNextPayment(planId: string, subscriber: string): void {
  const planKey = 'plan:' + planId;
  if (!Storage.has(planKey)) return;

  const planData = Storage.get(planKey).split('|');
  if (planData.length < 5) return;

  const frequency = planData[4];

  const slot = computeNextBillingSlot(frequency);

  // Encode (planId, subscriber) as params
  const params = new Args()
    .add(planId)
    .add(subscriber.toLowerCase())
    .serialize();

  const maxGas: u64 = 3_000_000;

  const id = deferredCallRegister(
    Context.callee().toString(), // call this contract
    'processRecurringPayment',
    slot,
    maxGas,
    params,
    0, // coins provided at execution (not booking fee)
  );

  Storage.set(deferredStorageKey(planId, subscriber), id);
}

/**
 * Cancel an existing scheduled deferred call for (planId, subscriber)
 */
function cancelScheduledPayment(planId: string, subscriber: string): void {
  const key = deferredStorageKey(planId, subscriber);
  if (!Storage.has(key)) return;

  const id = Storage.get(key);
  deferredCallCancel(id);
  Storage.deleteOf(Context.callee(), key);
}

/**
 * Allow creators to withdraw from their accumulated earnings.
 *
 * Args:
 *  - amount: string (MAS expressed as micro-MAS string)
 */
export function withdrawEarnings(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const amountStr = args.nextString().expect('Missing amount');

  const creator = Context.caller().toString().toLowerCase();
  const key = creatorBalanceKey(creator);

  if (!Storage.has(key)) {
    throw new Error('No balance available');
  }

  let current: u64 = U64.parseInt(Storage.get(key));
  const amount: u64 = U64.parseInt(amountStr);

  if (amount > current) {
    throw new Error('Insufficient balance');
  }

  // Update balance
  const updated = current - amount;
  Storage.set(key, updated.toString());

  // Transfer coins from contract → creator wallet
  const creatorAddr = new Address(creator);
  transferCoins(creatorAddr, <i64>amount);

  // Record in history
  recordWithdrawal(creator, amount);

  generateEvent(`Withdraw:${creator}:${amountStr}`);
}

// ------------------ SUBSCRIPTION MANAGEMENT ------------------

/**
 * Subscribe a user to a creator's plan.
 *
 * Args expected (in order):
 *  - action: string ("subscribe" | "pause" | "cancel")
 *  - planId: string
 */
export function manageSubscription(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);

  const action = args.nextString().expect('Missing action');
  const planId = args.nextString().expect('Missing planId');
  const subscriber = Context.caller().toString().toLowerCase();

  // Check plan existence
  const planKey = 'plan:' + planId;
  if (!Storage.has(planKey)) throw new Error('Plan does not exist: ' + planId);

  const planData = Storage.get(planKey).split('|');
  const creator = planData[5]; // Creator address
  const amountU64 = <u64>(parseFloat(planData[3]) * 1_000_000); // micro-MAS

  // Keys
  const subscribersKey = 'planSubscribers:' + planId;
  const userKey = 'userSubscriptions:' + subscriber;
  const timestampKey = 'planSubscriberDate:' + planId + ':' + subscriber;
  const pausedKey = 'planSubscriberPaused:' + planId + ':' + subscriber;

  // Load subscribers and user subscriptions
  let subscribers: string[] = Storage.has(subscribersKey)
    ? Storage.get(subscribersKey).split('|')
    : [];
  let userSubs: string[] = Storage.has(userKey)
    ? Storage.get(userKey).split('|')
    : [];

  // Action handling
  if (action == 'subscribe') {
    for (let i = 0; i < subscribers.length; i++) {
      if (subscribers[i] == subscriber) throw new Error('Already subscribed');
    }

    // Check transferred MAS
    const transferred: u64 = Context.transferredCoins();
    if (transferred < amountU64) throw new Error('Insufficient MAS sent');

    // NOTE:
    // transferred MAS is now held by this contract.
    // Recurring payouts will be sent over time via processRecurringPayment.

    // Add subscription
    subscribers.push(subscriber);
    userSubs.push(planId);

    Storage.set(subscribersKey, subscribers.join('|'));
    Storage.set(userKey, userSubs.join('|'));
    Storage.set(timestampKey, Context.timestamp().toString());

    // Clear any previous pause flag
    if (Storage.has(pausedKey)) {
      Storage.deleteOf(Context.callee(), pausedKey);
    }

    //initial earning to creator
    addCreatorEarnings(creator, amountU64);

    // Schedule first recurring payment
    scheduleNextPayment(planId, subscriber);

    generateEvent(`Subscribed:${planId}:${subscriber}`);
  } else if (action == 'pause') {
    let found = false;
    for (let i = 0; i < subscribers.length; i++) {
      if (subscribers[i] == subscriber) {
        found = true;
        break;
      }
    }
    if (!found) throw new Error('Not subscribed');

    Storage.set(pausedKey, 'true');

    // Optionally stop future scheduled billing immediately
    cancelScheduledPayment(planId, subscriber);

    generateEvent(`Paused:${planId}:${subscriber}`);
  } else if (action == 'cancel') {
    let found = false;
    let newSubscribers = new Array<string>();

    for (let i = 0; i < subscribers.length; i++) {
      if (subscribers[i] != subscriber) {
        newSubscribers.push(subscribers[i]);
      } else {
        found = true;
      }
    }
    if (!found) throw new Error('Not subscribed');

    // Update subscriber list
    if (newSubscribers.length == 0) {
      Storage.set(subscribersKey, '');
    } else {
      Storage.set(subscribersKey, newSubscribers.join('|'));
    }

    // Update user subscription list
    let newUserSubs = new Array<string>();
    for (let i = 0; i < userSubs.length; i++) {
      if (userSubs[i] != planId) {
        newUserSubs.push(userSubs[i]);
      }
    }

    if (newUserSubs.length == 0) {
      Storage.set(userKey, '');
    } else {
      Storage.set(userKey, newUserSubs.join('|'));
    }

    // Remove user pause + timestamp keys
    Storage.deleteOf(Context.callee(), pausedKey);
    Storage.deleteOf(Context.callee(), timestampKey);

    // Cancel scheduled billing
    cancelScheduledPayment(planId, subscriber);
  } else {
    throw new Error('Invalid action: ' + action);
  }
}

// ------------------ AUTONOMOUS RECURRING PAYMENT ------------------

/**
 * Process a recurring payment for a subscriber on a plan.
 *
 * Called automatically by Massa via deferredCallRegister.
 *
 * Args expected:
 *  - planId: string
 *  - subscriber: string
 */
export function processRecurringPayment(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const planId = args.nextString().expect('Missing planId');
  const subscriber = args
    .nextString()
    .expect('Missing subscriber')
    .toLowerCase();

  const planKey = 'plan:' + planId;
  if (!Storage.has(planKey)) {
    // Plan no longer exists; stop future scheduling.
    cancelScheduledPayment(planId, subscriber);
    return;
  }

  const planData = Storage.get(planKey).split('|');
  if (planData.length < 6) {
    cancelScheduledPayment(planId, subscriber);
    return;
  }

  const amountStr = planData[3];
  const frequency = planData[4];
  const creator = planData[5];

  const amountU64 = <u64>(parseFloat(amountStr) * 1_000_000); // micro-MAS

  const subscribersKey = 'planSubscribers:' + planId;
  if (!Storage.has(subscribersKey)) {
    cancelScheduledPayment(planId, subscriber);
    return;
  }

  const subs = Storage.get(subscribersKey).split('|');
  let stillSubscribed = false;
  for (let i = 0; i < subs.length; i++) {
    if (subs[i] == subscriber) {
      stillSubscribed = true;
      break;
    }
  }

  if (!stillSubscribed) {
    // user canceled; nothing more to do.
    cancelScheduledPayment(planId, subscriber);
    return;
  }

  // Respect pause flag
  const pausedKey = 'planSubscriberPaused:' + planId + ':' + subscriber;
  if (Storage.has(pausedKey) && Storage.get(pausedKey) == 'true') {
    cancelScheduledPayment(planId, subscriber);
    return;
  }

  // Attempt payout from contract balance to creator
  const creatorAddr = new Address(creator);
  transferCoins(creatorAddr, <i64>amountU64);

  // Track earnings
  addCreatorEarnings(creator, amountU64);

  // Update last charge timestamp
  const timestampKey = 'planSubscriberDate:' + planId + ':' + subscriber;
  Storage.set(timestampKey, Context.timestamp().toString());

  generateEvent(`RecurringPayment:${planId}:${subscriber}:${amountStr}`);

  // Schedule next cycle
  scheduleNextPayment(planId, subscriber);
}

// ------------------ VIEWS ------------------

export function getSubscribers(argsData: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(argsData);
  const planId = args.nextString().expect('Missing planId');

  const key = 'planSubscribers:' + planId;
  const subs = Storage.has(key) ? Storage.get(key) : '';

  return stringToBytes(subs); // string to StaticArray<u8>
}

export function getUserSubscriptions(
  argsData: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(argsData);
  const user = args.nextString().expect('Missing user').toLowerCase();
  const key = 'userSubscriptions:' + user;
  const subs = Storage.has(key) ? Storage.get(key) : '';
  return stringToBytes(subs);
}

export function getPlan(argsData: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(argsData);
  const planId = args.nextString().expect('Missing planId');
  const key = 'plan:' + planId;
  const plan = Storage.has(key) ? Storage.get(key) : '';
  return stringToBytes(plan);
}

export function isPaused(argsData: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(argsData);
  const planId = args.nextString().expect('Missing planId');
  const user = args.nextString().expect('Missing user').toLowerCase();
  const key = 'planSubscriberPaused:' + planId + ':' + user;
  const paused = Storage.has(key) ? Storage.get(key) : 'false';
  return stringToBytes(paused);
}

export function getSubscriberTimestamp(
  argsData: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(argsData);
  const planId = args.nextString().expect('Missing planId');
  const user = args.nextString().expect('Missing user').toLowerCase();
  const key = 'planSubscriberDate:' + planId + ':' + user;
  const ts = Storage.has(key) ? Storage.get(key) : '';
  return stringToBytes(ts);
}

export function getCreatorBalance(argsData: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(argsData);

  const creator = args.nextString().expect('Missing creator').toLowerCase();
  const key = creatorBalanceKey(creator);

  const balance = Storage.has(key) ? Storage.get(key) : '0';
  return stringToBytes(balance);
}

export function getWithdrawalHistory(
  argsData: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(argsData);

  const creator = args.nextString().expect('Missing creator').toLowerCase();
  const key = withdrawalsKey(creator);

  const history = Storage.has(key) ? Storage.get(key) : '';
  return stringToBytes(history);
}

// ------------------ CREATOR BALANCE HELPERS ------------------

function creatorBalanceKey(creator: string): string {
  return 'creatorBalance:' + creator.toLowerCase();
}

function withdrawalsKey(creator: string): string {
  return 'withdrawals:' + creator.toLowerCase();
}

/**
 * Add earnings to creator’s balance when a payment is processed.
 */
function addCreatorEarnings(creator: string, amount: u64): void {
  const key = creatorBalanceKey(creator);
  let current: u64 = 0;

  if (Storage.has(key)) {
    current = U64.parseInt(Storage.get(key));
  }

  const updated: u64 = current + amount;
  Storage.set(key, updated.toString());
}

/**
 * Record a withdrawal (for history).
 */
function recordWithdrawal(creator: string, amount: u64): void {
  const key = withdrawalsKey(creator);
  const ts = Context.timestamp().toString();
  const record = amount.toString() + ',' + ts;

  if (Storage.has(key)) {
    const existing = Storage.get(key);
    Storage.set(key, existing + ';' + record);
  } else {
    Storage.set(key, record);
  }
}

// -------------------------------
// CREATOR PROFILE
// -------------------------------

export function setCreatorProfile(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const profileCID = args.nextString().expect('Missing profileCID');
  const creator = Context.caller().toString().toLowerCase();

  // profile CID for creator
  const profileKey = 'creatorProfile:' + creator;
  // first profile for this creator, add to creator index
  const indexCountKey = 'creatorCount';
  let isNew = false;
  if (!Storage.has(profileKey)) isNew = true;

  Storage.set(profileKey, profileCID);
  generateEvent(`ProfileSet:${creator}:${profileCID}`);

  if (isNew) {
    //creators list
    let count = 0;
    if (Storage.has(indexCountKey)) {
      count = <i32>parseInt(Storage.get(indexCountKey));
    }
    const listKey = 'creatorList:' + count.toString();
    Storage.set(listKey, creator);
    Storage.set(indexCountKey, (count + 1).toString());
  }
}

export function getCreatorProfile(argsData: StaticArray<u8>): StaticArray<u8> {
  const params = new Args(argsData);
  const creator = params
    .nextString()
    .expect('Missing creator address')
    .toLowerCase();

  const profileKey = 'creatorProfile:' + creator;
  if (!Storage.has(profileKey)) {
    return new StaticArray<u8>(0);
  }
  const cid = Storage.get(profileKey);
  return stringToBytes(cid);
}

export function getCreatorCount(_: StaticArray<u8>): StaticArray<u8> {
  const key = 'creatorCount';
  const count = Storage.has(key) ? Storage.get(key) : '0';
  return stringToBytes(count);
}

export function getCreatorByIndex(argsData: StaticArray<u8>): StaticArray<u8> {
  const params = new Args(argsData);
  const idxStr = params.nextString().expect('Missing index'); //index as string
  const key = 'creatorList:' + idxStr;
  if (!Storage.has(key)) return new StaticArray<u8>(0);
  const creator = Storage.get(key);
  return stringToBytes(creator);
}

// -------------------------------
// CREATOR CONTENT
// -------------------------------

export function addCreatorContent(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const contentCID = args.nextString().expect('Missing contentCID');
  const creator = Context.caller().toString().toLowerCase();

  const countKey = 'contentCount:' + creator;
  let count = 0;
  if (Storage.has(countKey)) {
    count = <i32>parseInt(Storage.get(countKey));
  }

  const key = 'creatorContent:' + creator + ':' + count.toString();
  Storage.set(key, contentCID);
  Storage.set(countKey, (count + 1).toString());

  generateEvent(`ContentAdded:${creator}:${contentCID}`);
}

// Fetch all content CIDs for a given creator
export function getCreatorContents(argsData: StaticArray<u8>): StaticArray<u8> {
  const params = new Args(argsData);
  const creator = params.nextString().expect('Missing creator').toLowerCase();

  const countKey = 'contentCount:' + creator;
  if (!Storage.has(countKey)) return stringToBytes('');

  const total = <i32>parseInt(Storage.get(countKey));
  let result = '';

  for (let i = 0; i < total; i++) {
    const key = 'creatorContent:' + creator + ':' + i.toString();
    if (Storage.has(key)) {
      const cid = Storage.get(key);
      result += cid + ';'; // delimiter
    }
  }

  // Remove trailing semicolon if any
  if (
    result.length > 0 &&
    result.charCodeAt(result.length - 1) == ';'.charCodeAt(0)
  ) {
    result = result.substring(0, result.length - 1);
  }

  return stringToBytes(result);
}

// helper get number of posts
export function getCreatorContentCount(
  argsData: StaticArray<u8>,
): StaticArray<u8> {
  const params = new Args(argsData);
  const creator = params.nextString().expect('Missing creator').toLowerCase();
  const key = 'contentCount:' + creator;
  const count = Storage.has(key) ? Storage.get(key) : '0';
  return stringToBytes(count);
}
