export type UserRole = "patient" | "admin" | "root_admin";

export type User = {
	id: string;
	email: string;
	role: UserRole;
	authUserId: string | null;
};

export type Purchase = {
	id: string;
	paymentId: string;
	amount: string | number;
	amountBeforeDiscount: string | number;
	currency: string;
	paymentStatus: string;
	promoCode: string | null;
	receiptNumber: string | null;
	source: string | null;
	language: string;
	packAdded: boolean;
	isSubscriptionPurchased: boolean;
	purchaseCreationTime: string;
	userId: string;
	analysisResultId: string;
};

export type DoctorOpinion = {
	id: string;
	requiresDoctorOpinion: boolean;
	isOpinionFormCompleted: boolean;
	isDoctorOpinionSubmitted: boolean;
	medChartEventId: string | null;
	userId: string;
	analysisResultId: string;
};

export type Prediction = {
	confidence: number;
	icd: string | null;
	name: string;
	disease: string;
};

export type DetailPrediction = {
	ConfidenceType: number;
	ConfidenceWithAiModel: number;
	Icd: string | null;
	ReadMoreUrl: string | null;
	Name: string;
	ClassificationName: string;
	ExternalClassificationId: string;
	Description: string;
};

export type AnalysisResultJson = {
	AlgorithmType: number;
	ResponseMessage: {
		success: boolean;
		message: string | null;
		id: string | null;
		predictions: Prediction[];
	};
	Details: {
		PhotoUrl: string;
		Predictions: DetailPrediction[];
	};
};

export type AnalysisResult = {
	id: string;
	name: string;
	assetId: string;
	assetUrl: string;
	fileSize: string;
	fileType: string;
	userId: string;
	analysisResultJson: AnalysisResultJson | null;
	doctorOpinionId: string | null;
	purchaseId: string | null;
	doctorOpinion: DoctorOpinion | null;
	purchase: Purchase | null;
};

export type AuthSession = {
	accessToken: string;
	refreshToken: string;
	email: string;
};

export type MagicLinkResponse = {
	email: string;
	sent: boolean;
};

export type VerifyMagicLinkResponse = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	tokenType: string;
	userId: string;
	email: string;
};
