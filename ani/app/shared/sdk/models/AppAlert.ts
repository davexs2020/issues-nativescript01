/* tslint:disable */

declare var Object: any;
export interface AppAlertInterface {
  "AppAlertMessage": string;
  "id"?: number;
}

export class AppAlert implements AppAlertInterface {
  "AppAlertMessage": string;
  "id": number;
  constructor(data?: AppAlertInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `AppAlert`.
   */
  public static getModelName() {
    return "AppAlert";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of AppAlert for dynamic purposes.
  **/
  public static factory(data: AppAlertInterface): AppAlert{
    return new AppAlert(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'AppAlert',
      plural: 'AppAlerts',
      properties: {
        "AppAlertMessage": {
          name: 'AppAlertMessage',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
