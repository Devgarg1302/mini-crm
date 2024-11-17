import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId },
  orderDate: Date,
  amount: Number,
});

const Order = model('Order', orderSchema);

export default Order;
