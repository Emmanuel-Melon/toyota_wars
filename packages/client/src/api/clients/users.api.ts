import { createApiClient, AxiosApiClient } from "../../axios";
import type {
  ApiCollection,
  ApiResource,
  JsonApiSingleResponse,
} from "../api.types";
import type { components } from "../generated/api.types";
import { BaseApiClient } from "../index";

export type User = components["schemas"]["User"];
export type UserSingleResponse = components["schemas"]["UserSingleResponse"];
export type UserCollectionResponse =
  components["schemas"]["UserCollectionResponse"];
export type NewUser = components["schemas"]["NewUser"];
export type UserRole = "admin" | "partner" | "user";
export type CompleteOnboardingRequest =
  components["schemas"]["CompleteOnboardingRequest"];
export type StepOneInput = components["schemas"]["StepOneInput"];
export type StepTwoInput = components["schemas"]["StepTwoInput"];
export type UserResult = ApiResource<User, UserMetadata>;
export type UserResults = ApiCollection<User, UsersMetadata>;
export type GetUsersParams = components["schemas"]["GetUsersParams"];

export type UsersMetadata =
  components["schemas"]["UserCollectionResponse"]["metadata"];
export type UserMetadata =
  components["schemas"]["UserSingleResponse"]["metadata"];

export type ProfileStats = components["schemas"]["ProfileStats"];

export type ProfileStatsSingleResponse =
  components["schemas"]["ProfileStatsSingleResponse"];
export type ProfileStatsMetadata =
  components["schemas"]["ProfileStatsSingleResponse"]["metadata"];
export type ProfileStatsResult = ApiResource<ProfileStats, ProfileStatsMetadata>;

export type TourStep = {
  completed: boolean;
};

export type TourSteps = {
  "add-recipient": TourStep;
  "create-occasion": TourStep;
  "send-gift": TourStep;
};

export type TourProgress = {
  id: string;
  steps: TourSteps;
  progress: {
    completedCount: number;
    totalSteps: number;
    isComplete: boolean;
  };
};

export type TourMetadata = NonNullable<
  components["schemas"]["JsonApiResponse"]["metadata"]
>;
export type TourProgressResult = ApiResource<TourProgress, TourMetadata>;
export type TourProgressResponse = JsonApiSingleResponse<
  TourProgress,
  TourMetadata
>;

export class UsersApiClient extends BaseApiClient {
  protected readonly path = "/api/v1/users";
  constructor(api: AxiosApiClient = createApiClient()) {
    super(api);
  }

  public async getAllUsers(params?: GetUsersParams): Promise<UserResults> {
    const response = await this.api.request<UserCollectionResponse>(this.path, {
      method: "GET",
      params,
    });
    return this.unpackCollection(response, {
      errMsg: "Invalid users list",
    });
  }

  public async getUserById(userId: string): Promise<UserResult> {
    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/${userId}`,
    );
    return this.unpackSingle(response, { errMsg: "Invalid user data" });
  }

  public async getTourProgress(): Promise<TourProgressResult> {
    const response = await this.api.request<TourProgressResponse>(
      `${this.path}/me/tour`,
      { method: "GET" },
    );
    return this.unpackSingle(response, { errMsg: "Invalid tour progress" });
  }

  public async getProfileStats(): Promise<ProfileStatsResult> {
    const response = await this.api.request<ProfileStatsSingleResponse>(
      `${this.path}/me/stats`,
      { method: "GET" },
    );
    return this.unpackSingle(response, { errMsg: "Invalid profile stats" });
  }

  public async updateUser(
    userId: string,
    userData: Partial<User>,
  ): Promise<UserResult> {
    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/${userId}`,
      { method: "PATCH", headers: this.defaultHeaders, data: userData },
    );
    return this.unpackSingle(response, { errMsg: "Invalid user update" });
  }

  public async completeOnboarding(
    onboardingData: CompleteOnboardingRequest,
  ): Promise<UserResult> {
    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/onboarding`,
      { method: "POST", headers: this.defaultHeaders, data: onboardingData },
    );
    return this.unpackSingle(response, { errMsg: "Invalid onboarding data" });
  }

  public async uploadProfilePicture(
    userId: string,
    file: File,
  ): Promise<UserResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.api.request<UserSingleResponse>(
      `${this.path}/${userId}/profile-picture`,
      {
        method: "POST",
        data: formData,
      },
    );
    return this.unpackSingle(response, {
      errMsg: "Invalid profile picture upload",
    });
  }
}

let _usersApi: UsersApiClient | null = null;

export const usersApi = new Proxy({} as UsersApiClient, {
  get(_, prop) {
    if (!_usersApi) _usersApi = new UsersApiClient();
    return _usersApi[prop as keyof UsersApiClient];
  },
});
