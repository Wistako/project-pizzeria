import { select, templates } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

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
    thisBooking.dom.hourPicker = thisBooking.element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.datePicker = thisBooking.element.querySelector(select.widgets.datePicker.wrapper);
  }
  initWidget(){
    const thisBooking = this;
    thisBooking.widget = {};
    thisBooking.widget.people = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.widget.hours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.widget.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.widget.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}
export default Booking;