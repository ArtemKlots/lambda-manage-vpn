const AWS = require('aws-sdk');

const instanceId = process.env.INSTANCE_ID;

exports.handler = async (event, context, callback) => {
  console.log(event, context);
  if (!event?.queryStringParameters) {
    return
  }
  const { token, action } = event.queryStringParameters;
  console.log('token, action:', token, action);

  if (token !== process.env.SECRET) {
    return;
  }
  const ec2 = new AWS.EC2({ region: event.instanceRegion });


  switch (action) {
    case 'start': {
      try {
        await ec2.startInstances({ InstanceIds: [instanceId] }).promise()
          .then(() => `Successfully started ${instanceId}`)
        return {
          statusCode: 200,
          body: "VPN Start initiated"
        }
      } catch (e) {
        console.log(e);
        return {
          statusCode: 500,
          body: "VPN Start FAILED"
        }
      }
    }
    case 'stop': {
      try {
        await ec2.stopInstances({ InstanceIds: [instanceId] }).promise()
          .then(() => `Successfully stopped ${instanceId}`)
        return {
          statusCode: 200,
          body: "VPN Stop initiated"
        }
      } catch (e) {
        console.log(e);
        return {
          statusCode: 500,
          body: "VPN STOP FAILED!!!"
        }
      }
    }
    case 'describe': {
      const result = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
      console.log('result', result);
      const info = result.Reservations[0].Instances[0];
      console.log(info);
      return {
        statusCode: 500,
          body: `State: ${JSON.stringify(info.State)}\nPublic IP Address: ${info.PublicIpAddress}`
      }
    }
    default:
      return {
        statusCode: 400,
        body: "Action is not supported"
      }
  }

};