require('dotenv').config()
const cp = require('child_process');
const fs = require('fs');

const { PROFILE_NAME, SKILL_ID } = process.env

const notificationEnabler = async () => {
  cp.exec(
    `ask smapi get-skill-manifest -s ${SKILL_ID}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`ERROR: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`);
        return;
      }
      if (stderr) {
        console.log(stderr);
        return;
      }

      const skillManifest = JSON.parse(stdout)

      skillManifest?.manifest?.events?.publications ?
        skillManifest.manifest.events.publications.push({
          eventName: 'AMAZON.MessageAlert.Activated',
        })
        : skillManifest.manifest.events.publications = [{
          eventName: 'AMAZON.MessageAlert.Activated',
        }]

      skillManifest?.manifest?.permissions ?
        skillManifest.manifest.permissions.push({
          name: "alexa::devices:all:notifications:write",
        })
        : skillManifest.manifest.permissions = [{
          name: "alexa::devices:all:notifications:write",
        }]

      fs.writeFileSync('./manifest.json', JSON.stringify(skillManifest, null, 2));

      cp.execSync(
        `ask smapi update-skill-manifest -p ${PROFILE_NAME} -s ${SKILL_ID} -g development --manifest "$(cat manifest.json)"`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(
              `ERROR: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`,
            );
          }
          if (stderr) {
            console.log(stderr);
          }
          console.log(stdout);
        },
      );
      fs.unlinkSync('./manifest.json');
    },
  );
}
notificationEnabler()