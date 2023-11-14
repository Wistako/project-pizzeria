import BaseWidget from '../components/BaseWidget.js';
import {select, settings} from '../settings.js';
import {utils} from '../utils.js';

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.dom.fillDiv = thisWidget.dom.input.nextSibling;
    thisWidget.value = thisWidget.dom.input.value;
  }
  fillRange(bookedTables){
    const thisWidget = this;
    console.log(bookedTables);

    let options = 'to right';
    let i = 0;
    let rangeEnd = 0;
    let rangeStart = 0;
    while(i < 24){
      let color = '';
      switch(bookedTables[i]){
        case 2:
          color = ', yellow ';
          break;
        case 3:
          color = ', red ';
          break;
        default:
          color = ', green ';
          break;
      }
      if(bookedTables[i] == bookedTables[i+1]){
        rangeEnd += (100/24);
      } else {
        rangeEnd += (100/24);
        if(!rangeStart == 0 && parseInt(rangeEnd) != 100){
          options += color + parseInt(rangeStart) + '% ' + parseInt(rangeEnd) + '%';
        } else if (rangeStart == 0 ) {
          options += color + parseInt(rangeEnd) + '%';
        } else if (parseInt(rangeEnd) == 100){
          options += color + parseInt(rangeStart) + '%';
        }
        rangeStart = rangeEnd;
      }
      i++;
    }
    options = 'linear-gradient(' + options + ')';
    thisWidget.dom.fillDiv.style.background = 'green';
    thisWidget.dom.fillDiv.style.background = options;

    console.log(options);

  }
  initPlugin(){
    const thisWidget = this;
    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input, {
      fillClass: '',
    });
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(value){
    return utils.numberToHour(value);
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;
