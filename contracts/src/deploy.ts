import 'dotenv/config';
import {
  Account,
  Args,
  Mas,
  SmartContract,
  JsonRpcProvider,
} from '@massalabs/massa-web3';
import { getScByteCode } from './utils';

async function deployAndVerifyContract(): Promise<string> {
  const account = await Account.fromEnv();
  const provider = JsonRpcProvider.buildnet(account);

  console.log('🚀 Deploying contract...');

  // Load WASM bytecode
  const byteCode = getScByteCode('build', 'main.wasm');

  // Set constructor args (adjust if needed)
  const constructorArgs = new Args().addString('Massa');

  // Deploy contract
  const contract = await SmartContract.deploy(
    provider,
    byteCode,
    constructorArgs,
    { coins: Mas.fromString('0.01') },
  );

  console.log('📜 Contract deployed at:', contract.address);

  // Fetch deployment events
  const events = await provider.getEvents({
    smartContractAddress: contract.address,
  });
  events.forEach(ev => console.log('Event message:', ev.data));

  // Verify createPlan function exists with 7 string args
  const testArgs = new Args()
    .addString('plan1')
    .addString('My Plan')
    .addString('Description')
    .addString('USDC')
    .addString('100')
    .addString('monthly')
    .addString(new Date().toISOString());

  try {
    // Speculative call
    await contract.call('createPlan', testArgs, {
      fee: Mas.fromString('0.01'),
      maxGas: 100_000_000n,
      coins: 0n,
    });
    console.log('✅ createPlan verified: accepts 7 string arguments');
  } catch (err) {
    console.error('❌ createPlan verification failed:', err);
    throw new Error(
      'Deployed contract does not have createPlan with 7 string arguments'
    );
  }

  return contract.address;
}

// Execute
deployAndVerifyContract()
  .then(address => console.log('✅ Verified contract address:', address))
  .catch(err => {
    console.error('Deployment/verification failed:', err);
    process.exit(1);
  });
