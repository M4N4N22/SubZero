import { Storage, Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';

export function createPlan(
  planId: string,
  planName: string,
  description: string,
  token: string,
  amount: string,
  frequency: string,
  createdAt: string,
): void {
  const creator = Context.caller().toString();

  // Use a delimited string to reduce size instead of JSON
  const data = `${planName}|${description}|${token}|${amount}|${frequency}|${creator}|${createdAt}`;

  // Save plan data
  Storage.set('plan:' + planId, data);

  // Track plans per creator with indexed keys
  const countKey = 'creatorPlanCount:' + creator;
  const prefix = 'creatorPlan:' + creator + ':';

  const countStr = Storage.get(countKey);
  const count = countStr ? parseInt(countStr) : 0;

  Storage.set(prefix + count.toString(), planId);
  Storage.set(countKey, (count + 1).toString());

  generateEvent('PlanCreated:' + planId);
}

// ------------------ GET ALL PLANS BY CREATOR ------------------

export function getPlansByCreator(args: StaticArray<u8>): StaticArray<u8> {
  const params = new Args(args);
  const creator = params.nextString().expect("Missing creator address");

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
  const planId = params.nextString().expect("Missing planId");

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

