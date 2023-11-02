import { settings, select } from "../settings.js";

class AmountWidget{
  constructor (element){
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions();
    if(thisWidget.dom.input.value){
      thisWidget.setValue(thisWidget.dom.input.value);
    } else {
      thisWidget.setValue(settings.amountWidget.defaultValue);
    }
  }
  getElements(element){
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.element = element;
    thisWidget.dom.input = thisWidget.dom.element.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
    if( newValue !== thisWidget.value && !isNaN(newValue) && newValue <= settings.amountWidget.defaultMax && newValue >= settings.amountWidget.defaultMin){
      thisWidget.value = newValue;
      thisWidget.announce();
    } 
      thisWidget.dom.input.value = thisWidget.value;
    
  }
  announce(){
    const thisWidget = this;
    
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.element.dispatchEvent(event);
  }
  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', () =>{
       thisWidget.setValue(thisWidget.dom.input.value);
       
    });
    thisWidget.dom.linkDecrease.addEventListener('click', (event) =>{
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', (event) =>{
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;