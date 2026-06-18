import { sendEmail } from './jobs/sendEmail.js';
import { processImages } from './jobs/processImages.js';

console.log('Worker started');

// TODO: integrate with BullMQ / RabbitMQ / SQS
async function main() {
  await sendEmail({ to: 'test@example.com', subject: 'Welcome', body: 'Hello!' });
  console.log('Jobs processed');
}

main().catch(console.error);
