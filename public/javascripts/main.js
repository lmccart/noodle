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

var task = {
  trigger: [],
  query: []
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
    task.trigger.push($(this).val());
    var new_id = elt.attr('id') + '_';
    if (is_arr) {
      elt.parent().append('<input type="text" name="hi" id="'+new_id+'"/>');
      $('#'+new_id).change(function() {     
        task.trigger.push($(this).val()); 
        console.log(task);
        cb();
      });
    } else {
      elt.parent().append('<span id="'+new_id+'"></span>');
      elt.parent().append(createDrop($('#'+new_id), obj[$(this).val()], cb));
    }
  });
  
}


function startQuery() {
  $('#query-selection').show();

  $('#query-selection select').change(function(){
    task.question = ($(this).val());
    if ($(this).val() === 'mc') $('#query-selection .submodule').show();
    console.log(task);
  });

  $('#query-selection input').change(function() {
    updateActions();
  });

}

function updateActions() {
  $('#action-selection').show();
  $('#action-selection').html('');
  $('#query-selection input').each(function(e) {
    if ($(this).val() != '') {
      var new_id = 'action_'+$(this).val();
      $('#action-selection').append('<br>If the human answers '+$(this).val()+': <span id="'+new_id+'"></span>');
      createDrop($('#'+new_id), actions, null);
    }
  });
}



// index page
$('#submit').click(function(e){
  console.log('hi');
  window.location = './confirm?q='+$('textarea#query').val();
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



