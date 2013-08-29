var horrible_variables  = 'in the global scope';

var someDevelopers = 'care not for best practices';

var ThisObjectIsImportant = new Object();

ThisObjectIsImportant.doSomething = function () {
  window.letsNotCareAboutScoping = 'and just put things everywhere';
};

var s = ThisObjectIsImportant;
s.t = 'Wat?!';