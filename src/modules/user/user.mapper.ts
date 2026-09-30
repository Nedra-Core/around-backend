import {PublicUserResponseDto, ResponseDto, responseDtoSchema, publicUserResponseSchema} from "./user.dto";

export const mapToResponseDto = (data: any): ResponseDto => {
    return responseDtoSchema.parse(data);
};

export const mapToPublicUserResponseDto = (data: any): PublicUserResponseDto => {
    return publicUserResponseSchema.parse(data);
}