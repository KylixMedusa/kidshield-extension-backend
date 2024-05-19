import Mongo from "../db";

const runMigration = async () => {
  // Add your migration code here

  console.log("Migration ran successfully!");

  process.exit(0);
};

Mongo.initiateConnection().then(() => {
  runMigration();
});
