import { Schema, model } from 'mongoose';

const customerSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  age: Number,
  gender: String,
  totalSpending: Number,
  visits: Number,
  lastVisit: Date,
});


const Customer = model('Customer', customerSchema);

export default Customer;
