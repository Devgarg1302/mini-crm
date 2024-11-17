import Kafka from "./kafkalogin.js";

function getPartition(message) {
  const { gender, totalSpending, age } = message;

 
  // Define partition logic for gender
  const genderPartitions = {
      Male: 0,
      Female: 1,
      Others: 2
  };

  // Define partition logic for total spendings
  const spendingPartitions = totalSpending >= 10000 ? 3 : (totalSpending <= 10000 ? 4 : 5);

  // Define partition logic for age
  let agePartition;
  if (age <= 18) agePartition = 6;
  else if (age <= 40) agePartition = 7;
  else agePartition = 8;

  // Combine all logic into one partition selection strategy
  // For simplicity, using a hash of all factors or a modulo operation to get the final partition
  return (genderPartitions[gender] + spendingPartitions + agePartition) % 8;
}

const producer = async (topic,message) => {
    const producer = Kafka.producer();
    producer.connect().then(() => {
        console.log('Connected to Kafka');
        producer.send({
            topic,
            messages: [
              { value: JSON.stringify(message),
                partition: getPartition(message)  
              }
            ]
          }).then(() => {
            console.log('Message sent successfully');
            producer.disconnect();
        });
    });
}

export default producer;