import { createApiClient, type AxiosApiClient } from "../../axios";
import type { ApiResource } from "../api.types";
import type { components } from "../generated/api.types";
import { BaseApiClient } from "../index";

export type Catalog = components["schemas"]["Catalog"];
export type CatalogSingleResponse =
  components["schemas"]["CatalogSingleResponse"];

export type CatalogMetadata = CatalogSingleResponse["metadata"];
export type CatalogResult = ApiResource<Catalog, CatalogMetadata>;

export class CatalogApiClient extends BaseApiClient {
  protected readonly path = "/api/v1/catalog";

  constructor(api: AxiosApiClient = createApiClient()) {
    super(api);
  }

  public async getCatalog(): Promise<CatalogResult> {
    const response = await this.api.request<CatalogSingleResponse>(this.path, {
      method: "GET",
    });
    return this.unpackSingle(response, { errMsg: "Invalid game catalog" });
  }
}

let _catalogApi: CatalogApiClient | null = null;

export const catalogApi = new Proxy({} as CatalogApiClient, {
  get(_, prop) {
    if (!_catalogApi) _catalogApi = new CatalogApiClient();
    return _catalogApi[prop as keyof CatalogApiClient];
  },
});
