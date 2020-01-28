import * as React from 'react';
import { ICarouselImagesProps } from './ICarouselImagesProps';
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Placeholder } from '@pnp/spfx-controls-react/lib/Placeholder';
import AspectRatio from 'react-aspect-ratio';

export interface IImage {
  id : number;
  title : string;
  image : string;
  link: string;
}

class CarouselImages extends React.Component<ICarouselImagesProps, any> {

  constructor(props){
    super(props);
    this.state = {
      images : []
    };
  }

  public componentDidMount(){
    if(this.props.list_name != ""){
      let headers = {
        accept: "application/json;odata=verbose"
      };
      axios.get(`${this.props.context.pageContext.site.absoluteUrl}/_api/web/lists/GetByTitle('${this.props.list_name}')/items`, {headers: headers})
        .then(response => {
          let data : JSON = response.data["d"];
          let res = data["results"];
          res.forEach(result => {
            let image : IImage = { id: result["Id"], title: result["Title"], image: result["Imagen"]["Url"], link: result["Link"]["Url"]};
            this.setState({ images: [...this.state.images, image] });
          });
        }).catch(error => {
          console.info(error);
        });
    }
  }

  private renderPlaceHolder = () : JSX.Element => {
    return (
      <Placeholder
          iconName='Edit'
          iconText="Carrusel de imagenes "
          description="Especifique una lista de imagenes"/>
    );
  }

  private renderCarrusel = () : JSX.Element => {
    var images : IImage[] = this.state.images;
    return (
      <Carousel autoPlay={true} showThumbs={false} infiniteLoop={true} showStatus={false} onClickItem={(index)=>{
        let data : IImage[] = this.state.images;
        window.open(data[index].link, '_blank');
      }} >
        {
          images.map(image => {
            return (
              <AspectRatio ratio="16/9" style={{ maxWidth: '100%' }}>
                <img src={image.image} />
                <p className="legend" style={{ opacity:"90%" }}>{image.title}</p>
              </AspectRatio>
            );
          })
        };
      </Carousel>
    );
  }

  public render(): React.ReactElement<ICarouselImagesProps> {
    return this.props.list_name === "" ? this.renderPlaceHolder() : this.renderCarrusel();
  }

}

export default CarouselImages;