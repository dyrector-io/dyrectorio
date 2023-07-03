package image

// types
type (
	RemoteCheck = remoteCheck
)

// errs
var (
	ErrDigestsMatching = errDigestsMatching
	ErrDigestMismatch  = errDigestMismatch
)

// funcs
var (
	AuthConfigToBasicAuth = authConfigToBasicAuth
	ParseDistributionRef  = parseDistributionRef
	CheckRemote           = checkRemote
	ShouldUseLocalImage   = shouldUseLocalImage
)
