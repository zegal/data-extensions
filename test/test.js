require("dotenv").config();
const Mongoose = require("mongoose").Mongoose; // to make diff instance of mongoose as we have to connect 2 db

let mongoose = new Mongoose();
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

let dataField = "metadata";

const {init, extendMetaData} = require("../src");

init(mongoose);

let EmployeeSchema = require("../src/db/models/test/employee");

const options = require("./employee-options");

EmployeeSchema = extendMetaData({name: "employee", 
                                 schema: EmployeeSchema, 
                                 metamodels: ["tags", "data"], 
                                 options: options});

let EmployeeModel = mongoose.model("employee", EmployeeSchema);

async function create(data) {
    let john = new EmployeeModel(data);
    return await john.save();
}

async function getEmployees(firstName) {
    console.log("getEmployees", firstName)
    let johns = await EmployeeModel.find({firstName: firstName}).lean();
    johns.forEach(item => {
        console.log(item);
    })
}

async function getEmployeesAgg(firstName) {
    console.log("getEmployeesAgg", firstName)
    let johns = await EmployeeModel.aggregate([
        {$match: {firstName: firstName}}
    ]).allowDiskUse(true);
}

async function getOneByName(firstName) {
    let john = await EmployeeModel.findOne({firstName}).lean();
    return john;
}

async function getOneById(id) {
    let john = await EmployeeModel.findOne({_id: id}).lean();
    return john;
}


async function updateById(id, john) {
    await EmployeeModel.updateOne({_id: id}, john);
    return;
}

async function updateMany(firstName, john) {
    await EmployeeModel.updateMany({firstName: firstName}, john);
    return;
}

async function deleteOne(query) {
    await EmployeeModel.deleteOne(query);
    return;
}

async function deleteMany(query) {
    await EmployeeModel.deleteMany(query);
    return;
}

async function findOneAndDelete(query) {
    return await EmployeeModel.findOneAndDelete(query);
}

async function findOneAndUpdate(query, data) {
    return await EmployeeModel.findOneAndUpdate(query, data);
}

async function run() {
    let john;
    john = await create({employerId: "121212", firstName: "John", lastName: "Doe", foo: "bar", [dataField]: {ssn: '11111111', gender: 'm'}, tags: ["vip", "sales"]});
    john = await getOneById(john._id);

    console.log("got john", john)
    //await deleteOne({_id: john._id});
    //await findOneAndDelete({_id: john._id});
    //await deleteMany({firstName: "John"});
    //console.log("deleted john", john)
    //console.log("oneById", john)
    //john = await getOneByName("bob");
    //console.log("oneByName", john)
    john.firstName = "Bob";
    john[dataField].ssn = '3333333';
    await findOneAndUpdate({_id: john._id}, john);
    //await updateMany('John', {firstName: 'bob', [dataField]: {ssn: '999999'}});
    //console.log("updated john", john) */
    //await getEmployees("John");
    await getEmployeesAgg("Bob");
    process.exit();
}

run();