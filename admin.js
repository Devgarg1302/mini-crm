import Kafka from './kafkalogin.js';

async function init() {
    const admin = Kafka.admin();
    
    admin.connect()
    console.log("Admin Connected")
    admin.createTopics({
        topics:[{
            topic:'customerTopic',
            numPartitions:8
        },
        {
            topic: 'orderTopics',
        }]
    });

    console.log("Topics Created")

    await admin.disconnect();

    console.log("Admin Disconnected")
}

init();