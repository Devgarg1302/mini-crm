import pkg from 'joi';

const orderSchema = pkg.object({
  customerId: pkg.string().required(),
  orderDate: pkg.date().required(),
  amount: pkg.number().required(),
});

export default data => orderSchema.validate(data);
