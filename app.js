import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connect } from 'mongoose';
import bodyParser from 'body-parser';
import pkg from 'cors';
import {v4 as uuidv4} from 'uuid';
const { cors } = pkg;
import customerRoutes from './routes/customerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import Customer from './models/Customer.js';
import Group from './models/Group.js'
import Campaign from './models/Campaign.js';
import Log from './models/communication_log.js'

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(pkg({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
}));

connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/campaigns', async (req,res)=>{
  const campaigns = new Campaign(req.body);
  await campaigns.save();
});


function divideRandomly(totalSize) {
  const randomFactor = Math.random();
  const part1 = Math.ceil(totalSize * randomFactor);
  const part2 = totalSize - part1;
  return { part1, part2 };
}

const buildMongoQuery = (conditions) => {
  const queryParts = [];

  conditions.forEach((condition) => {
    const { field, operators, connector } = condition;

    const fieldConditions = operators.map((op) => ({
      [field]: { [`$${op.operator}`]: field === 'lastVisit' ? new Date(op.value) : op.value },
    }));

    const combinedFieldQuery =
      fieldConditions.length > 1 ? { $and: fieldConditions } : fieldConditions[0];
    if (queryParts.length > 0 && connector === 'OR') { 
      queryParts.push({ $or: [queryParts.pop(), combinedFieldQuery] });
    } else {
      queryParts.push(combinedFieldQuery);
    }
  });

  return queryParts.length > 1 ? { $and: queryParts } : queryParts[0];
};

app.post('/api/audience/filter-and-save', async (req, res) => {
  const { conditions } = req.body;

  try {
    const mongoQuery = buildMongoQuery(conditions);

    const existingGroup = await Group.findOne({ group_conditions: mongoQuery });

    if (existingGroup) {
      return res.status(400).json({ error: 'Group with the same conditions already exists.' });
    }

    const audienceSize = await Customer.countDocuments(mongoQuery);

    const group = new Group({
      group_id: uuidv4(),
      group_conditions: mongoQuery,
      audienceSize:audienceSize
    })

    await group.save();

    res.status(200).json({
      message: 'Filtered data saved successfully!',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to filter and save data.' });
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find({});
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

  app.get('/api/group/:group_id', async(req,res)=>{
  
  const group_id = req.params;
  try {
    const group = await Group.findOne(group_id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const groupConditions = group.group_conditions;

    const customers = await Customer.find(groupConditions);

    const audienceSize = await Customer.countDocuments(groupConditions);

    res.status(200).json({
      group_id,
      group_conditions: groupConditions,
      customers,
      audienceSize
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch group data.' });
  }
})


app.get('/api/campaign/history', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ created_at: -1 });
    res.status(200).json({campaigns});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

app.get('/api/campaign/:id', async (req, res) => {
  const campaignId = req.params
  try {
    const log = await Log.find({campaignId: campaignId.id});
    console.log(log);
    res.status(200).json({log});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});


app.post('/submit', async (req,res)=>{

  const group = await Group.findOne({group_id: req.body.groups})
  
  const groupConditions = group.group_conditions;

  const audienceSize = await Customer.countDocuments(groupConditions);

  const result = divideRandomly(audienceSize);

  try {
      const campaign = await Campaign.create({
        name: req.body.name,
        description: req.body.description,
        group_id: req.body.groups,
        audienceSize: audienceSize
      })

      const log = await Log.create({
        campaignId: campaign._id,
        audienceSize: audienceSize,
        message_sent: result.part1,
        message_failed: result.part2
      })

      res.redirect('http://localhost:5173/campaigns');
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
