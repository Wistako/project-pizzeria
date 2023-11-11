import { templates } from "../settings.js";
import { utils } from "../utils.js";

class Gallery{
  constructor(element){
    const thisGallery = this;
    thisGallery.render(element);
  }
  render(element){
    const thisGallery = this;
    const generatedHTML = templates.gallery();
    thisGallery.element = utils.createDOMFromHTML(generatedHTML);
    element.appendChild(thisGallery.element);
  }
}
export default Gallery;