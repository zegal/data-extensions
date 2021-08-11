require("dotenv").config();
const Mongoose = require("mongoose").Mongoose; // to make diff instance of mongoose as we have to connect 2 db

let mongoose = new Mongoose();
mongoose.connect(process.env.MONGO_DB_DEN, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

const {init, extend} = require("../src");

init(mongoose);

let EmployeeSchema = require("./model/employee");

EmployeeSchema = extend({name: "employee", schema: EmployeeSchema, metamodels: ["data", "tags"], inlineWithObject: false});

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


async function run() {
    let john;
    john = await create({firstName: "John", lastName: "Doe", foo: "bar", data: {ssn: '11111111', gender: 'm'}, tags: ["vip", "sales"]});
    john = await getOneById(john._id);
    //john = await getOneByName("bob");
    console.log("one", john)
    john.firstName = "Bob";
    john.data.ssn = '444444';
    //await updateById(john._id, john);
    await updateMany('John', {firstName: 'bob', data: {ssn: '999999'}});
    //console.log("updated john", john)
    await getEmployees("bob");
    process.exit();
}

run();