import { createApiClient, type AxiosApiClient } from "../../axios";
import type { ApiCollection, ApiResource } from "../api.types";
import type { components } from "../generated/api.types";
import { BaseApiClient } from "../index";

export type Tank = components["schemas"]["Tank"];
export type GetTanksParams = components["schemas"]["GetTanksParams"];
export type TankSingleResponse = components["schemas"]["TankSingleResponse"];
export type TankCollectionResponse =
  components["schemas"]["TankCollectionResponse"];

export type TankMetadata = TankSingleResponse["metadata"];
export type TanksMetadata = TankCollectionResponse["metadata"];
export type TankResult = ApiResource<Tank, TankMetadata>;
export type TankResults = ApiCollection<Tank, TanksMetadata>;

export class TanksApiClient extends BaseApiClient {
  protected readonly path = "/api/v1/tanks";

  constructor(api: AxiosApiClient = createApiClient()) {
    super(api);
  }

  public async getTanks(params?: GetTanksParams): Promise<TankResults> {
    const response = await this.api.request<TankCollectionResponse>(this.path, {
      method: "GET",
      params,
    });
    return this.unpackCollection(response, { errMsg: "Invalid tanks list" });
  }

  public async getTankById(id: string): Promise<TankResult> {
    const response = await this.api.request<TankSingleResponse>(
      `${this.path}/${encodeURIComponent(id)}`,
    );
    return this.unpackSingle(response, { errMsg: "Invalid tank data" });
  }
}

let _tanksApi: TanksApiClient | null = null;

export const tanksApi = new Proxy({} as TanksApiClient, {
  get(_, prop) {
    if (!_tanksApi) _tanksApi = new TanksApiClient();
    return _tanksApi[prop as keyof TanksApiClient];
  },
});
