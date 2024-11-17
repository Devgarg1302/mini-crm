import { Schema, model } from 'mongoose';

const campaignSchema = new Schema({
  name: String,
  description: String,
  group_id: String,
  audienceSize: Number,
  created_at: { type: Date, default: Date.now },
});

const Campaign = model('Campaign', campaignSchema);

export default Campaign;
