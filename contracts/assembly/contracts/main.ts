import { Storage, Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args,stringToBytes  } from '@massalabs/as-types';

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

  // ✅ Check if the count key exists before reading
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

    // Add subscription
    subscribers.push(subscriber);
    userSubs.push(planId);

    Storage.set(subscribersKey, subscribers.join('|'));
    Storage.set(userKey, userSubs.join('|'));
    Storage.set(timestampKey, Context.timestamp().toString());

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
    generateEvent(`Paused:${planId}:${subscriber}`);
  } else if (action == 'cancel') {
    let found = false;
    let newSubscribers = new Array<string>();
    for (let i = 0; i < subscribers.length; i++) {
      if (subscribers[i] != subscriber) newSubscribers.push(subscribers[i]);
      else found = true;
    }
    if (!found) throw new Error('Not subscribed');

    subscribers = newSubscribers;
    Storage.set(subscribersKey, subscribers.join('|'));

    // Update user subscriptions
    let newUserSubs = new Array<string>();
    for (let i = 0; i < userSubs.length; i++) {
      if (userSubs[i] != planId) newUserSubs.push(userSubs[i]);
    }
    userSubs = newUserSubs;
    Storage.set(userKey, userSubs.join('|'));

    // Remove paused/timestamp keys
    Storage.deleteOf(Context.callee(), pausedKey);
    Storage.deleteOf(Context.callee(), timestampKey);

    generateEvent(`Canceled:${planId}:${subscriber}`);
  } else {
    throw new Error('Invalid action: ' + action);
  }
}

export function getSubscribers(argsData: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(argsData);
  const planId = args.nextString().expect('Missing planId');

  const key = 'planSubscribers:' + planId;
  const subs = Storage.has(key) ? Storage.get(key) : '';

  return stringToBytes(subs); // convert string to StaticArray<u8>
}
