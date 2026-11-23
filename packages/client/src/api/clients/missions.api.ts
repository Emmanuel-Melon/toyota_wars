import { createApiClient, type AxiosApiClient } from "../../axios";
import type { ApiCollection, ApiResource } from "../api.types";
import type { components } from "../generated/api.types";
import { BaseApiClient } from "../index";

export type Mission = components["schemas"]["Mission"];
export type GetMissionsParams = components["schemas"]["GetMissionsParams"];
export type MissionSingleResponse =
  components["schemas"]["MissionSingleResponse"];
export type MissionCollectionResponse =
  components["schemas"]["MissionCollectionResponse"];

export type MissionMetadata = MissionSingleResponse["metadata"];
export type MissionsMetadata = MissionCollectionResponse["metadata"];
export type MissionResult = ApiResource<Mission, MissionMetadata>;
export type MissionResults = ApiCollection<Mission, MissionsMetadata>;

export class MissionsApiClient extends BaseApiClient {
  protected readonly path = "/api/v1/missions";

  constructor(api: AxiosApiClient = createApiClient()) {
    super(api);
  }

  public async getMissions(params?: GetMissionsParams): Promise<MissionResults> {
    const response = await this.api.request<MissionCollectionResponse>(
      this.path,
      { method: "GET", params },
    );
    return this.unpackCollection(response, { errMsg: "Invalid missions list" });
  }

  public async getMissionById(id: string): Promise<MissionResult> {
    const response = await this.api.request<MissionSingleResponse>(
      `${this.path}/${encodeURIComponent(id)}`,
    );
    return this.unpackSingle(response, { errMsg: "Invalid mission data" });
  }
}

let _missionsApi: MissionsApiClient | null = null;

export const missionsApi = new Proxy({} as MissionsApiClient, {
  get(_, prop) {
    if (!_missionsApi) _missionsApi = new MissionsApiClient();
    return _missionsApi[prop as keyof MissionsApiClient];
  },
});
