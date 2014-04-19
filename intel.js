
module.exports = function(params) {

  var fs = require('fs')
    , util = require("util")
    , parseString = require('xml2js').parseString
    , json2xml = require('json2xml')
    , _ = require('underscore');

  var intel = {};
  intel.mturk = null;
  intel.checkInterval = null;
  intel.bucket;

  // attempt login from config file
  fs.readFile('./data/config.json', 'utf8', function(err, data) {
    if (data) {
      data = JSON.parse(data);
      if (data.aws.accessKeyId && data.aws.secretAccessKey) {
        intel.login(data.aws);
      }
    }
  });

  var RegisterHITTypeOptions = { 
    Title: "Mturk Nodejs module RegisterHITType test"
    , Keywords: "keyword1, keyword2, keyword3" 
    , Description: "Test description"
    , Reward: {Amount: 0.50, CurrencyCode: "USD"}
    , AssignmentDurationInSeconds: 120
    , AutoApprovalDelayInSeconds: 3600
    , QualificationRequirement: []
  };

  intel.login = function(params) {
    console.log(params);
    intel.mturk =  require('./mturk')({creds: params, sandbox: false});

    fs.readFile('./data/config.json', 'utf8', function(err, data) {
      if (data) data = JSON.parse(data);
      else data = {};

      if (!data.aws) data.aws = {}
      data.aws.accessKeyId = params.accessKeyId;
      data.aws.secretAccessKey = params.secretAccessKey;
  
      console.log(data)
      fs.writeFile('./data/config.json', JSON.stringify(data), function (err) {
        if (err) throw err;
      });

      intel.bucket = params.accessKeyId.toLowerCase()+'_noodle/';
    });

    console.log('logged in');
  }

  intel.createHit = function(task, func){
    console.log('create hit '+task);


    RegisterHITTypeOptions.Title = 'One question survey';


      // Step 1: First we have to create a HITTypeId
    intel.mturk.RegisterHITType(RegisterHITTypeOptions, function(err, HITTypeId){
      if (err) throw err;

      fs.readFile('./data/question_form_'+task.query.type+'.xml', 'utf8', function(err, data) {
        if (err) throw err;

        parseString(data, function (err, result) {
          result.QuestionForm.Question[0].QuestionContent[0].Text[0] = [task.query.question];

          if (task.query.type == 'mc') {
            for (var i=0; i<task.query.choices.length; i++) {
              result.QuestionForm.Question[0].AnswerSpecification[0].SelectionAnswer[0].Selections[i].Selection[0].Text = task.query.choices[i];
            }
          }

          // pend hack for now, implement rest with system
          if (task.query.input[0] == 'camera') {
            if (task.query.input[1] == 'take a photo') {
              console.log("adding photo");
              result.QuestionForm.Overview[0].Binary[0].DataURL[0] = 'https://s3.amazonaws.com/'+intel.bucket+task.id+'.jpg';
            }
          }
 
          result.attr = {xmlns:"http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd"};
          result = json2xml(result, { attributes_key:'attr' });

          var CreateHITOptions = {
            'HITTypeId': HITTypeId
            , 'Question': result
            , 'LifetimeInSeconds': 60 * 20  // How long should the assignment last?
            , 'MaxAssignments': 1
          };
          console.log('register '+HITTypeId);

          // Step 2: Now create the HIT itself.
          intel.mturk.CreateHIT(CreateHITOptions, function(err, HITId){
            if (err) throw err;
            console.log("Created HIT "+HITId);

            // callback
            func(HITId);
          }); 
        });


      });
    });

  }

  intel.removeHit = function(params){

    intel.mturk.DisableHIT(params, function(err, HITId) {
      if (err) console.log(err);
      console.log("disabled hit "+HITId);
    });

  }

  intel.checkForHits = function(tasks, cb) {
    intel.mturk.GetReviewableHITs({}, function(err, result){
      if (result) {
        var hits = (result.HIT instanceof Array) ? result.HIT : [result.HIT];
        hits.forEach(function(HIT){
          //console.log(HIT);
          // For each reviewable HIT, get the assignments that have been submitted
          intel.mturk.GetAssignmentsForHIT({ "HITId": HIT.HITId }, function(err, result){
            if (result) {
              var assignments = (result.Assignment instanceof Array) ? result.Assignment : [result.Assignment];
              assignments.forEach(function(assignment){
                if (assignment) {
                  if (assignment.AssignmentStatus === "Submitted") {

                    intel.mturk.ApproveAssignment({"AssignmentId": assignment.AssignmentId, "RequesterFeedback": "Great work!"}, function(err, id){ 
                      console.log("approved "+assignment.AssignmentId);
                    });

                    parseString(assignment.Answer, function (err, result) {
                      var answer;
                      var resp = result.QuestionFormAnswers.Answer[0];
                      if (resp.FreeText) answer = resp.FreeText[0];
                      else if (resp.SelectionIdentifier) answer = resp.SelectionIdentifier[0];
                      console.log(answer);
                      var task = _.find(tasks, function(t) { console.log(t.hit_id, HIT.HITId); return t.hit_id == HIT.HITId; });
                      
                      if (task) {
                        task.query.answer = answer;
                        cb(task);
                      }
                    });
                  }
                }
              });
            }
          });
          
        });
      }
    });
  };

  return intel;
};



