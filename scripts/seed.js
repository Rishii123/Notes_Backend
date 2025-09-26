require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

async function main(){
    await connectDB();

    // Clear existing users
    await User.deleteMany({});

    const acme = await Tenant.findOneAndUpdate({ slug:'acme' }, { slug:'acme', name:'Acme', plan:'FREE' }, { upsert:true, new:true });
    const globex = await Tenant.findOneAndUpdate({ slug:'globex' }, { slug:'globex', name:'Globex', plan:'FREE' }, { upsert:true, new:true });

    const createUser = async (email, role, tenant)=>{
        const exists = await User.findOne({ email });
        if(!exists){
            await User.create({ email, password:'password', role, tenantId: tenant._id });
            console.log('Created', email);
        }
    };

    await createUser('admin@acme.test','ADMIN', acme);
    await createUser('user@acme.test','MEMBER', acme);
    await createUser('admin@globex.test','ADMIN', globex);
    await createUser('user@globex.test','MEMBER', globex);

    console.log('Seeding complete');
    process.exit(0);
}

main();
