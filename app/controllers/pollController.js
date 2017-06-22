const mongoose = require('mongoose');
// get poll model
const Poll = require(process.cwd() + '/app/models/poll');
// get user model
const User = require(process.cwd() + '/app/models/user');
const Option = require(process.cwd() + '/app/models/option');

exports.findUser = (req, res, next) => {
  User.findById(req.user._id, function(err, user) {
      if (user) {

        //create new poll 
        let poll = new Poll();
        poll.owner = user._id;
        poll.question = req.body.question;
        poll.url = 'https://agile-retreat-20088.herokuapp.com/vote?id=' + poll._id;

        req.body.options.forEach(function(val, i) {
          let option = new Option();
          option.owner = user.id;
          option.question = req.body.question;
          option.questionId = poll._id;
          option.answer = val;
          option.votes = 0;
          poll.options.push(option._id);


          option.save(err => {
            if (err) {
              throw new Error(err);
            }
          })
        });

        poll.save(function(err) {
          if (err) {
            throw new Error(err)
          } else {

            req.poll = poll;

            return next();
          }
        })
      }
    })
    .catch(err => {
      throw Error(err);
    });
}


//success page after poll added to database
exports.success = (req, res) => {

  Option.find({ questionId: req.poll._id }, (err, doc) => {
    if (err) {
      throw new Error(err)
    }
    res.render('poll.ejs', { user: req.user, poll: req.poll, options: doc });

  });


}

exports.findPoll = (req, res) => {
  //get id from param and find poll
  Poll.findById(req.query.id, (err, doc) => {
      if (doc) {

        Option.find({ questionId: req.query.id }, function(err, opt) {
            if (err) {
              throw new Error(err)
            }
            res.render('poll.ejs', { user: req.user, poll: doc, options: opt });
          })
          // console.log('doc',doc)

      }
    })
    .catch(err => {
      throw new Error(err)
    });
}

exports.getJSON = (req, res) => {
  Poll.findById(req.query.id, (err, doc) => {
    if(err){
      throw new Error(err);
    }
      if (doc) {

        Option.find({ questionId: req.query.id }, function(err, opt) {
            if (err) {
              throw new Error(err)
            }
            res.send(opt);
          })
          // console.log('doc',doc)

      }
    });

}


exports.showAll = (req, res) => {
  Poll.find({owner: req.user._id},{},{sort: {date: -1}}, (err,polls) => {
    if(err){
      throw new Error(err);
    }

    // console.log(polls)
    res.render('allPolls.ejs', {user: req.user, polls: polls, url: 'showAll'});
  })
}

exports.delete = (req, res) => {

// console.log('q',req.query);
// console.log('p',req.params);
      Poll.remove({_id: req.query.id}, (err) =>{

          if(err){
            throw new Error(err);
          }


              Poll.find({owner: req.user._id},{},{sort: {date: -1}},  (err,polls) => {
                if(err){
                  throw new Error(err);
                }
                  res.render('allPolls.ejs', {user: req.user, polls: polls, message: 'Poll sucessfully deleted', url:'delete'});

        })

      });

}


exports.vote = (req, res) => {
    // console.log('params vote', req.params.param);
    // console.log('cookie', req.session.id)
  if(req.params.param){
    id = req.params.param;
  }else {
    console.log('pollid',req.body.pollId)
    id = req.body.pollId;
  }

   let index = req.body.option;
   let custom = req.body.custom;




      console.log('index', index);
      console.log('custom', custom);
      console.log('id', id);
      // console.log('user id', req.user.id)


      Poll.findById(id, function(err, poll){
        if(err){
          throw new Error(err);
        }

                
          Option.find({ questionId: id }, function(err, opt) {
            if (err) {
              throw new Error(err);
            }

              let cantVote = '';

            if(poll.voted.length > 0){
              console.log('poll voted')
              for(let i =0; i < poll.voted.length; i++){
               
                  if(poll.voted[i] === req.session.id){
                      console.log('already voted');
                       cantVote =  poll.voted[i] ;
                      break;
                   
                  } 
                  else if(req.user){
                console.log('user is true');
                 console.log('v', poll.voted[i])
                  console.log('v', req.user.id);
                    if(poll.voted[i] == req.user.id){
                            console.log('user already voted');
                        cantVote =  poll.voted[i];
                          break;
                      
                    }
                  }
                }
            }

              console.log('cantVote', cantVote)
            
            if(cantVote && req.user ){
                res.render('sorry.ejs', {user: req.user.id || req.user._id , poll: poll, options: opt });
            }
            else if(cantVote){
         
                res.render('sorry.ejs', {user: null, poll: poll, options: opt });
            }
            else if(!cantVote && !custom){
              //add votes
                  // console.log('t', opt[index]);
                  let winner = opt[index];
                  console.log('val', opt[index].voted);
                  // opt[index].votes =   opt[index].votes++;
                  // console.log('voted', poll);
          
                  winner.votes++;
                  if(req.user){

                    winner.voted.push(req.user._id || req.user.id);
                    poll.voted.push(req.user._id || req.user.id)
                    // poll.voted.push(req.session.id);
                   } else{
                     winner.voted.push(req.session.id);
                     poll.voted.push(req.session.id);
                   }
                              
                  // console.log('votes', winner.votes);

                  poll.save(err => {
                    if(err){
                      throw new Error(err);
                    }
                    console.log('poll saved');
                  })

                  winner.save((err, updated) => {
                    if (err) {
                      throw new Error(err);
                    }
                    // console.log('updated', updated);
                    res.render('thankyou.ejs', { user: req.user, poll: poll, options: opt });
                  });
          
        }
         else if(custom){
                 let option = new Option();
                  option.owner = poll.owner;
                  option.question = poll.question;
                  option.questionId = poll._id;
                  option.answer = custom;
                  option.votes = 1;

                  poll.options.push(option._id);

                  if(req.user){

                console.log('is user');
                      option.voted.push(req.user._id || req.user.id);
                      poll.voted.push(req.user._id || req.user.id);
                   }else{
                        console.log('is unknown');
                      option.voted.push(req.session.id);
                      poll.voted.push(req.session.id);
                   }
                  poll.save(err => {
                    if(err){
                      throw new Error(err);
                    }
                  });
                      option.save(err => {
                        // console.log('hh')
                          if (err) {
                            throw new Error(err);
                          }
                           res.render('thankyou.ejs', { user: req.user, poll: poll, options: opt });
                        });
                 
            }
            else if(!index){//in case there's no selection
                res.render('poll.ejs', { user: req.user, poll: poll, options: opt });
            }
          });
      });
    }

    exports.allPolls = (req, res) => {
      Poll.find({},{},{sort: {date: -1}},(err, polls) =>{
        if(err){
          throw new Error(err);
        }
        console.log(polls);
        res.render('allPolls.ejs', {user: req.user, polls: polls, url:'allPolls'});
      })
    }
