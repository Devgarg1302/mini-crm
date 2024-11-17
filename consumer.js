import Kafka from './kafkalogin.js';
import Customer from './models/Customer.js';
import Order from './models/Order.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connect } from 'mongoose';


const consumer = Kafka.consumer({ groupId: 'crm-group' });

connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const consumeMessages = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'customerTopic', fromBeginning: true });
  await consumer.subscribe({ topic: 'orderTopic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message, partition }) => {
      const data = JSON.parse(message.value.toString());
      console.log(data);
      console.log(`[${topic}] , Part:${partition}` , message.value.toString());
      try {
        if (topic === 'customerTopic') {
          const customer = new Customer(data);
          await customer.save();
        } else if (topic === 'orderTopic') {
          const order = new Order(data);
          await order.save();
        }
      } catch (err) {
        console.error(`Failed to process message: ${err.message}`);
      }
    },
  });
};

consumeMessages();