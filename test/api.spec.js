import express from 'express';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { testdata, testAds } from '../api/data/data';
// import { testdata, testAds } from '../api/models/users';
import userRoutes from '../api/routes/auth';
import propertyRoutes from '../api/routes/property';

const app = express();
app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/property', propertyRoutes);
const should = chai.should();
let agentToken = '';
let userToken = '';

chai.use(chaiHttp);

describe('/POST/signup routes', () => {
  it('CREATES a new User', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signup')
      .send(testdata[0])
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.user.should.be.a('object');
        res.body.user.should.have.property('firstName');
        res.body.user.should.have.property('lastName');
        res.body.user.should.have.property('address');
        res.body.should.have.property('status').eql(201);
        userToken = res.body.user.token;
        done();
      });
  });
  it('CREATES a new Agent', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signup')
      .send(testdata[5])
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.agent.should.be.a('object');
        res.body.agent.should.have.property('firstName');
        res.body.agent.should.have.property('lastName');
        res.body.agent.should.have.property('address');
        res.body.should.have.property('status').eql(201);
        agentToken = res.body.agent.token;
        done();
      });
  });
  it('CHECKS if User already Exists', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signup')
      .send(testdata[0])
      .end((err, res) => {
        res.should.have.status(409);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql(409);
        res.body.should.have.property('error').eql('user already exists');
        done();
      });
  });
});

describe('/POST/signin routes', () => {
  it('ENABLE User login', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signin')
      .send(testdata[3])
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.user.should.be.a('object');
        res.body.user.should.have.property('isAgent');
        res.body.user.should.have.property('phoneNumber');
        res.body.user.should.have.property('email');
        res.body.should.have.property('status').eql(200);
        done();
      });
  });
  it('CHECK if User provided details are wrong', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signin')
      .send(testdata[4])
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql(400);
        res.body.should.have.property('error').eql('wrong username or password');
        done();
      });
  });
  it('CHECK if User doesnt Exists', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signin')
      .send(testdata[10])
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql(400);
        res.body.should.have.property('error').eql('user doesnt exist please signup');
        done();
      });
  });
});

describe('ALL AGENT strict routes', () => {
  it('CREATES a new Property', (done) => {
    chai.request(app)
      .post('/api/v1/property')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testAds[0])
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.property.should.be.a('object');
        res.body.property.should.have.property('price');
        res.body.property.should.have.property('city');
        res.body.should.have.property('status').eql(201);
        done();
      });
  });
  it('CREATES a new Property', (done) => {
    chai.request(app)
      .post('/api/v1/property')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testAds[9])
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql(400);
        res.body.should.have.property('error').eql('price should be a number not less than 1');
        done();
      });
  });
  it('CHECK if property exists', (done) => {
    chai.request(app)
      .post('/api/v1/property')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testAds[0])
      .end((err, res) => {
        res.should.have.status(409);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('You can not post this propety again');
        done();
      });
  });
  it('UPDATE a Property', (done) => {
    chai.request(app)
      .patch('/api/v1/property/3')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testAds[2])
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.property.should.be.a('object');
        res.body.property.should.have.property('address');
        res.body.property.should.have.property('city');
        res.body.should.have.property('status').eql(200);
        done();
      });
  });
  it('PATCH a Property', (done) => {
    chai.request(app)
      .patch('/api/v1/property/3/sold')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testAds[2])
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.property.should.be.a('object');
        res.body.property.should.have.property('status').eql('sold');
        res.body.should.have.property('status').eql(200);
        done();
      });
  });
  it('GET a specific Property', (done) => {
    chai.request(app)
      .get('/api/v1/property/3')
      .set('Authorization', `Bearer ${agentToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.property.should.be.a('object');
        res.body.property.should.have.property('address');
        res.body.property.should.have.property('status');
        res.body.should.have.property('status').eql(200);
        done();
      });
  });
  it('DELETE a Property', (done) => {
    chai.request(app)
      .delete('/api/v1/property/3')
      .set('Authorization', `Bearer ${agentToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('property deleted successfully');
        res.body.should.have.property('status').eql(200);
        done();
      });
  });
  it('VIEW all Property', (done) => {
    chai.request(app)
      .get('/api/v1/property')
      .set('Authorization', `Bearer ${agentToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.property.should.be.a('array');
        res.body.should.have.property('status').eql(200);
        done();
      });
  });
  it('view specific property', (done) => {
    chai.request(app)
          .get('/api/v1/property?type=3bedrooms')
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
});
describe('/CHECK tokens and relevant middlewares', () => {
  it('CHECK if token is provided', (done) => {
    chai.request(app)
      .get('/api/v1/property')
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('provide a token to get our services');
        done();
      });
  });
  it('CHECK for ivalid token', (done) => {
    chai.request(app)
      .get('/api/v1/property')
      .set('Authorization', `Bearer ${agentToken}1`)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        done();
      });
  });
  it('CHECK agent ownership', (done) => {
    chai.request(app)
      .patch('/api/v1/property/1/sold')
      .set('Authorization', `Bearer ${agentToken}`)
      .end((err, res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        done();
      });
  });
  it('GET NOTFOUND Property', (done) => {
    chai.request(app)
      .get('/api/v1/property/9')
      .set('Authorization', `Bearer ${agentToken}`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.a('object');
        done();
      });
  });
  it('QUERY PARAMS validate id', (done) => {
    chai.request(app)
      .get('/api/v1/property/9-')
      .set('Authorization', `Bearer ${agentToken}`)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('provide a valid number in parameters');
        done();
      });
  });
  it('check user is agent', (done) => {
    chai.request(app)
      .patch('/api/v1/property/1/sold')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Accept', 'application/json')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('error').eql('Only agent can access this service');
        done();
      });
  });
});

describe('/VALIDATES all input fields', () => {
  it('VALIDATES signup required fields', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signup')
      .send(testdata[1])
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql(400);
        res.body.should.have.property('error').eql('isAgent should be a boolean');
        done();
      });
  });
  it('VALIDATES invalid characters', (done) => {
    chai.request(app)
      .post('/api/v1/users/auth/signup')
      .send(testdata[11])
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').eql(400);
        res.body.should.have.property('error').eql("One of the field  is invalid");
        done();
      });
  });
  it('VALIDATES property input', (done) => {
    chai.request(app)
      .post('/api/v1/property')
      .set('Authorization', `Bearer ${agentToken}`)
      .send(testAds[4])
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('One of the field  is invalid');
        done();
      });
  });
  it('view specific property', (done) => {
    chai.request(app)
          .get('/api/v1/property?type=bedrooms')
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.have.property('error').eql('We only have these types 1bedrooms, 3bedrooms, 5bedrooms, miniFlat ,others');
            done();
          });
  });
  it('view specific property', (done) => {
    chai.request(app)
          .get('/api/v1/property?type=1bedrooms')
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.property('error').eql('Ooops property type not found');
            done();
          });
  });
  
});
