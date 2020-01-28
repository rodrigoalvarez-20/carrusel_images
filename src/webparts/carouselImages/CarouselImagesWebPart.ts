import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';

import axios from "axios";

import * as strings from 'CarouselImagesWebPartStrings';
import CarouselImages from './components/CarouselImages';
import { ICarouselImagesProps } from './components/ICarouselImagesProps';

export interface ICarouselImagesWebPartProps {
  list_name: string;
  width: number;
  height: number;
}

export default class CarouselImagesWebPart extends BaseClientSideWebPart<ICarouselImagesWebPartProps> {

  private lists : IPropertyPaneDropdownOption[];
  
  protected onPropertyPaneConfigurationStart() {
    this.loadLists().then(response => {
      this.lists = response;
      this.context.propertyPane.refresh();
      this.render();
    }).catch(error => {
      console.log(error);
    });
  } 
  
  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>(
      (resolve : (options: IPropertyPaneDropdownOption[]) => void, reject: (error: any) => void) => {
        axios.get(`${this.context.pageContext.site.absoluteUrl}/_api/web/lists`).then(response => {
          let data : JSON = response.data;
          let lists : Map<string, any> = data["value"];
          var items = [];
          lists.forEach(value =>{
            items.push({ key: value["Title"], text: value["Title"] });
          });
          resolve(items);
        }).catch(error => {
          reject(error);
        })
      });
  }

  public render(): void {
    const element: React.ReactElement<ICarouselImagesProps> = React.createElement(
      CarouselImages,
      {
        list_name: this.properties.list_name,
        width: this.properties.width,
        height: this.properties.height,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "Configuracion",
              groupFields: [
                PropertyPaneDropdown('list_name', {
                  label: "Seleccione una lista del sitio",
                  options: this.lists,
                  disabled: false
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
