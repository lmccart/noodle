var task = {
  trigger: [],
  query: {},
  actions: []
};

var triggers = {
  microphone: {
    noise: ['is louder than', 'is quieter than']
  },
  camera: {
    movement: ['is bigger than', 'makes more sense than'],
    faces: ['is bigger than', 'makes more sense than']
  },
  clock: {
    time: ['is later than', 'is better than']
  }
};

var input = {
  microphone: {
    record: ['3s', '10s']
  },
  camera: ['take a photo', 'send 10s of video']
};


var actions = {
  microphone: {
    noise: ['is louder than', 'is quieter than']
  },
  camera: {
    movement: ['is bigger than', 'makes more sense than'],
    faces: ['is bigger than', 'makes more sense than']
  },
  clock: {
    time: ['is later than', 'is better than']
  }
};


window.onload=function(){
  createDrop($('#triggers'), triggers, startQuery);
  $('#trigger-selection').show();
};

function createDrop(elt, obj, cb) {
  var is_arr = (Object.prototype.toString.call( obj ) === '[object Array]');

  var keys = [];
  if (is_arr) {
    keys = obj;
  } else {
    _.each( obj, function( val, key ) { keys.push(key); });
  }

  var insert = '<select><option value=""></option>';
  for (var i=0; i<keys.length; i++) {
    insert += '<option value="'+keys[i]+'">'+keys[i]+'</option>';
  }
  insert += '</select>';
  elt.html(insert);
  $('#'+elt.attr('id')+' select').change(function(){
    //task.trigger.push($(this).val());
    var new_id = elt.attr('id') + '_';
    if (is_arr) {
      var mans = elt.parent().children();
      for (var i=0; i<mans.length; i++) {
        console.log(mans[i]);
      }
      eraseAllAfter(elt);
      elt.parent().append('<input type="text" class="part" id="'+new_id+'"/>');
      $('#'+new_id).change(function() {     
        //task.trigger.push($(this).val());
        console.log(task);
        if (cb) cb();
      });
    } else {
      eraseAllAfter(elt);
      elt.parent().append('<span class="part" id="'+new_id+'"></span>');
      elt.parent().append(createDrop($('#'+new_id), obj[$(this).val()], cb));
    }
  });
  
}

function eraseAllAfter(elt) {
  var all = elt.parent().children();
  var found = false;
  for (var i=0; i<all.length; i++) {
    if (found) {
      $('#'+all[i].id).remove();
    }
    if (elt.attr('id') == all[i].id) {
      found = true;
    }
  }
}

function startQuery() {
  $('#query-selection').show();

  $('#query-selection select').change(function(){
    task.query.type = ($(this).val());    
    $('#action-selection').show();
    $('#action-selection').html('');
    if ($(this).val() === 'mc') $('#query-selection .submodule').show();
    else {
      $('#query-selection .submodule').hide()
    }
    buildActions();
  });

  $('#query-selection input').change(function() {
    updateMC();
  });

}

function buildActions() {
  var choices = [];
  if (task.query.type === 'tf') {
    choices = ['true', 'false'];
  } else if (task.query.type === 'sa') {
    choices = ['anything'];
  }

  _.each(choices, function(c) {
    if (c != '') {
      var new_id = 'action_'+c;
      $('#action-selection').append('<div class="action" id="'+new_id+'">If the human answers '+c+': <span class="part" id="'+new_id+'_"></span></div>');
      createDrop($('#'+new_id+'_'), actions, null);
    }
  });
}

function updateMC() {
  var choices = [];
  $('#query-selection input').each(function(e) {
    if ($(this).val().length > 0) choices.push($(this).val());
  });

  var adivs = $('#action-selection .action');
  
  // clear div and refill
  $('#action-selection').empty();
  for (var i=0; i<choices.length; i++) {
    var new_id = 'action_'+choices[i];
    var found = false;
    for (var j=0; j<adivs.length; j++) {
      if (adivs[j].id == new_id) {
        $('#action-selection').append(adivs[j]);
        found = true;
      } 
    }
    if (!found) {
      $('#action-selection').append('<div class="action" id="'+new_id+'">If the human answers '+choices[i]+': <span class="part" id="'+new_id+'_"></span></div>');
      createDrop($('#'+new_id+'_'), actions, null);
    }
  }
}

// index page
$('#submit').click(function(e){
  // add triggers
  $('#trigger-selection select').each(function() {
    task.trigger.push($(this).val());
  });
  $('#trigger-selection input').each(function() {
    task.trigger.push($(this).val());
  });

  // add query
  task.query.question = $('textarea#question').val();

  // add choices for mc
  if (task.query.type === 'mc') {
    task.query.choices = [];
    $('#query-selection input').each(function(e) {
      task.query.choices.push($(this).val());
    });
  }

  // add actions
  $('#action-selection .action').each(function() {
    console.log('action');
    var a = [];
    $(this).find('select').each(function() {
      a.push($(this).val());
    });
    $(this).find('input').each(function() {
      a.push($(this).val());
    });
    task.actions.push(a);
  });

  console.log(task);
  $.ajax({
    url:"/add",
    type:"POST",
    data:task, 
    success:function (res) { console.log(res); window.location = './manage' }
  });
});

// login page
$('#login').click(function(e){
  window.location = './?s='+$('input#secret_key').val()+'&a='+$('input#access_key').val();
});

// manage page
$('.remove').click(function(e){
  var hit = $(e.target).parent()[0].id;
  console.log(hit);
  window.location = './remove?hit='+hit;
});



