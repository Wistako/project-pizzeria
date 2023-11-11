import { classNames, select, settings, templates } from "../settings.js";
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
    thisBooking.getData();
    thisBooking.initActions();
  }
  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.widget.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.widget.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        startDateParam,
      ],
    };

    const urls = {
      booking:        settings.db.url + '/' + settings.db.bookings
                                      + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.events
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events 
                                      + '?' + params.eventsRepeat.join('&'),
    }
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);  
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    const minDate = thisBooking.widget.datePicker.minDate;
    const maxDate = thisBooking.widget.datePicker.maxDate;

    for (let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table);
      
    }
  }

  initActions(){
    const thisBooking = this;

    thisBooking.dom.tablesMap.addEventListener('click', (e) => {
      console.log(e.target);
      thisBooking.setTable(e.target);
    });
    thisBooking.dom.timePickerWrapper.addEventListener('updated', () => {
      thisBooking.cleanTableMap();
    });
    thisBooking.dom.wrapper.addEventListener('submit', (event) =>{
      event.preventDefault();
      thisBooking.sendBooking();
    })
  }

  setTable(clickedTable){
    const thisBooking = this;
    // const newTab = thisBooking.selectedTable.splice(1, thisBooking.selectedTable.length);
    
    thisBooking.selectedTable = '';
    
    if(
      !clickedTable.classList.contains(classNames.booking.tableBooked) 
      &&
      !clickedTable.classList.contains(classNames.booking.tableSelected))
      {
        const tableId = clickedTable.getAttribute('data-table');
        clickedTable.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable = tableId;
      } else {
        clickedTable.classList.remove(classNames.booking.tableSelected);
      }

    for(let table of thisBooking.dom.tables){
      if(table && table != clickedTable){
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
  }
  cleanTableMap(){
    const thisBooking = this;

    const tables = thisBooking.dom.tables;
    for (let table of tables) {
      table.classList.remove(classNames.booking.tableSelected);
    }
  }
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.widget.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.widget.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

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
    thisBooking.dom.timePickerWrapper = thisBooking.element.querySelector(select.booking.timePicker);
    thisBooking.dom.tables = thisBooking.element.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesMap = thisBooking.element.querySelector(select.booking.tablesMap);
    thisBooking.dom.phone = thisBooking.element.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.element.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.element.querySelectorAll(select.booking.starters);
  }

  initWidget(){
    const thisBooking = this;
    thisBooking.widget = {};
    thisBooking.widget.people = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.widget.hours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.widget.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.widget.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', () =>{
      thisBooking.updateDOM();
    });
  }

  prepareBookingParams(){
    const thisBooking = this;

    const bookLoad = {};
    bookLoad.date = thisBooking.widget.datePicker.value;
    bookLoad.hour = thisBooking.widget.hourPicker.value;
    bookLoad.duration = thisBooking.widget.hours.value;
    bookLoad.ppl = thisBooking.widget.people.value;
    bookLoad.phone = thisBooking.dom.phone.value;
    bookLoad.address = thisBooking.dom.address.value;
    
    if(thisBooking.selectedTable){
      bookLoad.table = parseInt(thisBooking.selectedTable);
    } else {
      bookLoad.table = null;
    }
    
    bookLoad.starters = [];
    for(let starter of thisBooking.dom.starters){
      if(starter.checked == true){
        bookLoad.starters.push(starter.value);
        if(!bookLoad.starters.includes('water')){
          bookLoad.starters.push('water');
        }
      }
    }
    
    return bookLoad
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const bookingParam = thisBooking.prepareBookingParams();

    const options = {
      method: 'POST',
      headers: {
       'Content-Type': 'application/json', 
      },
      body: JSON.stringify(bookingParam)
    };

    fetch(url, options)
    console.log(bookingParam);
    thisBooking.makeBooked(bookingParam.date, bookingParam.hour, bookingParam.duration, bookingParam.table);
    console.log(thisBooking.booked);
    thisBooking.cleanTableMap();
    thisBooking.updateDOM();
  }
}
export default Booking;