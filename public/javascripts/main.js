

var trigger_category, trigger_specific;


$('#trigger-selection').show();
$('#trigger-selection .category').show();

$('#trigger-selection .category .button').click(function(e){
	$('#trigger-selection .category .button').each(function() {
 		if (e.target !== this) { $(this).removeClass('selected'); }
	});
	$(e.target).addClass('selected');
	trigger_category = e.target.innerHTML;

	var spec = '#trigger-selection .specific'+'.'+trigger_category;
	console.log(spec);
	$(spec).show();

});


$('#trigger-selection .specific .button').click(function(e){
	console.log('hi');
	$('#trigger-selection .specific .button').each(function() {
 		if (e.target !== this) { $(this).removeClass('selected'); }
	});
	$(e.target).addClass('selected');
	trigger_specific = e.target.innerHTML;

	$('#query-selection').show();
});


$('#submit').click(function(e){
	console.log('hi');
	window.location = './confirm?q='+$('textarea#query').val();
});

$('.remove').click(function(e){
	var hit = $(e.target).parent()[0].id;
	console.log(hit);
	window.location = './remove?hit='+hit;
});



