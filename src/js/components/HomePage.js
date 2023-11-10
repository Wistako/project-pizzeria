import { select, templates } from "../settings.js";
import { utils } from "../utils.js";
import Carousel from "./Carousel.js";
 class homePage{
  constructor(elem){
    const thisPage = this;

    thisPage.render(elem);
    thisPage.getElements();
    thisPage.initActions();
    thisPage.initCarousel();
  }
  render(element){
    const thisPage = this;
    const generatedHTML = templates.homePage();
    thisPage.wrapper = element;
    thisPage.element = utils.createDOMFromHTML(generatedHTML);
    element.appendChild(thisPage.element);
  }
  getElements(){
    const thisPage = this;
    thisPage.dom = {};
    thisPage.dom.wrapper = thisPage.element;
    thisPage.dom.linkBooking = thisPage.wrapper.querySelector(select.banner.booking);
    thisPage.dom.linkOrder = thisPage.wrapper.querySelector(select.banner.order);
    thisPage.dom.carousel = document.querySelector(select.containerOf.carousel);
  }
  initActions(){
    const thisPage = this;

    
    thisPage.dom.linkBooking.addEventListener('click', (e) =>{
      e.preventDefault();
      
      const href = thisPage.dom.linkBooking.getAttribute('href');
      const pageId = href.replace('#', '');

      const event = new CustomEvent('link',{
        bubbles: true,
       detail: {
        pageId: pageId,
       },
      });

      thisPage.element.dispatchEvent(event);
    });

    thisPage.dom.linkOrder.addEventListener('click', (e)=>{
      e.preventDefault();
      const href = thisPage.dom.linkOrder.getAttribute('href');
      const pageId = href.replace('#', '');

      const evernt = new CustomEvent('link',{
      bubbles: true,
        detail: {
         pageId: pageId,
        },
       });

       thisPage.element.dispatchEvent(evernt);
    })
  }
  initCarousel(){
    const thisPage = this;
    thisPage.carousel = new Carousel(thisPage.dom.carousel);
  }
}

export default homePage;