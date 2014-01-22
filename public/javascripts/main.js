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

var query = [];


window.onload=function(){
  createDrop($('#triggers'), triggers);
  $('#trigger-selection').show();
};

function createDrop(elt, obj) {
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
  console.log(elt);
  elt.html(insert);
  $('#'+elt.attr('id')+' select').change(function(){
    query.push($(this).val());
    var new_id = elt.attr('id') + '_';
    if (is_arr) {
      elt.parent().append('<input type="text" name="hi" id="'+new_id+'"/>');
      $('#'+new_id).change(function() {     
        query.push($(this).val()); 
        console.log("DONE!");
        console.log(query);
      });
    } else {
      elt.parent().append('<span id="'+new_id+'"></span>');
      elt.parent().append(createDrop($('#'+new_id), obj[$(this).val()]));
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



