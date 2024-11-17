import pkg from 'joi';

const customerSchema = pkg.object({
  name: pkg.string().required(),
  email: pkg.string().email().required(),
  age: pkg.number().required(),
  gender: pkg.string().required(),
  totalSpending: pkg.number().required(),
  visits: pkg.number().required(),
  lastVisit: pkg.date().required(),
});

export default data => customerSchema.validate(data);
