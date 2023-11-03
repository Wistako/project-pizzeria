import { select, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.getElements();
    thisBooking.initWidget();
  }
  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    element.appendChild(thisBooking.element);
  }
  getElements(){
    const thisBooking = this;
    
    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.hoursAmount = thisBooking.element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.peopleAmount = thisBooking.element.querySelector(select.booking.peopleAmount);
  }
  initWidget(){
    const thisBooking = this;
    thisBooking.widget = {};
    thisBooking.widget.people = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.widget.hours = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
export default Booking;