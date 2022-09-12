import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/-/g, '')
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

const makeid = function (length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

Schema.statics.createUser = async function (email, password) {
  const user = await this.create({ password, email });
  return user;
};

Schema.statics.getUserByEmailLogin = async function (email, password) {
  try {
    const user = await this.findOne({ email: email, password: password });
    if (!user) {
      throw (new Error('No user with this login found'));
    }
    return user;
  } catch (error) {
    console.error(error);
    return false;
  }
};

Schema.statics.getUsers = async function () {
  const users = await this.find();
  return users;
};

Schema.statics.deleteByUserById = async function (id) {
  const result = await this.remove({ _id: id });
  return result;
};

Schema.statics.updateProfile = async function (id, bio) {
  const filter = { _id: id };
  const update = {
    bio: bio
  };

  const doc = await this.findOneAndUpdate(filter, update, {
    new: true
  });
  return doc;
};

Schema.statics.updateUser = async function (id, user) {
  const filter = { _id: id };
  const update = user;

  const doc = await this.findOneAndUpdate(filter, update, {
    new: true
  });
  return doc;
};

Schema.statics.getUserByPasswordValidation = async function (mail, code) {
  const filter = {
    mail: mail,
    resetCode: code,
    resetCodeCreatedAt: {
      $gte: new Date(Date.now() - 15 * 60 * 1000)
    }
  };
  const doc = await this.findOneAndUpdate(filter, { $unset: { resetCode: '', resetCodeCreatedAt: '' } });
  return doc;
};

Schema.statics.addResetRequest = async function (email) {
  const filter = { mail: email };
  const code = makeid(20);
  const update = {
    resetCode: code,
    resetCodeCreatedAt: new Date()
  };

  const doc = await this.findOneAndUpdate(filter, update, {
    new: true
  });
  return code;
};

Schema.statics.updatePP = async function (id, ppLocation) {
  const filter = { _id: id };
  const update = {
    ppLocation: ppLocation
  };

  const doc = await this.findOneAndUpdate(filter, update, {
    new: true
  });
  return doc;
};

export default mongoose.model('Model', Schema);
