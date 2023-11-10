import { templates } from "../settings.js";
import { utils } from "../utils.js";

class Carousel {
  constructor(wrapper){
    const thisCarousel = this;
    thisCarousel.render(wrapper);
    thisCarousel.initPlugin();
  }
  
  render(element){
    console.log(element);
    const thisCarousel = this;
    const generatedHTML = templates.carousel();
    thisCarousel.element = utils.createDOMFromHTML(generatedHTML);
    element.appendChild(thisCarousel.element);
  }
  initPlugin(){
    const thisCarousel = this; 
    // eslint-disable-next-line no-undef
    thisCarousel.plugin =new Flickity(thisCarousel.element, {
      autoPlay: 3000,
      prevNextButtons: false,
      setGallerySize: false,
    })
  }
}

export default Carousel;