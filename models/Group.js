import { Schema, model } from 'mongoose';

const groupSchema = new Schema({
  group_id: String,
  group_conditions: Object,
  audienceSize: Number
});


const Group = model('Group', groupSchema);

export default Group;
