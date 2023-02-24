import {templates, classNames, settings, select} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = null;  

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam ,startDateParam, endDateParam,],
      eventsRepeat: [settings.db.repeatParam, endDateParam,],
    };


    const urls = {
      bookings:       settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };
    
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });}

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};


    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
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

  updateDOM(){
    const thisBooking = this;
    
    
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
    }
    for(let table of thisBooking.dom.tables){
      
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      table.classList.remove(classNames.booking.tableSelected);
      console.log('selected table', thisBooking.selectedTable);
      
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(!allAvailable
         && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;

    const clickedElement = event.target;
    const selectedId = clickedElement.getAttribute(settings.booking.tableIdAttribute);

    // if clicked element is a table
    if (clickedElement.classList.contains('table')) {
      // check if table is booked alert user
      if (clickedElement.classList.contains('booked')) {
        alert('This table is already booked');
      } 
      // if table is not booked 
      // if it is selected remove selected class
      else if (clickedElement.classList.contains(classNames.booking.tableSelected)){
        clickedElement.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTable = null;
        console.log('remove from thisBooking.selectedTable', thisBooking.selectedTable);
      }
      else {
        // remove selected class from other tables
        for(let table of thisBooking.dom.tables){
          table.classList.remove(classNames.booking.tableSelected);
          console.log('removed class selected from all tables');
          
        }
        // if table is not selected add selected class

        clickedElement.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable = selectedId;
        console.log('added to thisBooking.selectedTable', thisBooking.selectedTable);
      }
    }
  }
  
  
  render(element){
    const thisBooking = this;
    // generate html for booking container from template
    const generatedHTML = utils.createDOMFromHTML(templates.bookingWidget());
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.appendChild(generatedHTML);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.amount.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.amount.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = document.querySelector(select.containerOf.tables);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });
  } 
}

export default Booking;