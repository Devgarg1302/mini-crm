import { Schema, model } from 'mongoose';

const logSchema = new Schema({
  campaignId: String,
  audienceSize: Number,
  message_sent: Number,
  message_failed:Number,
});

const log = model('CommunicationLog', logSchema);

export default log;
