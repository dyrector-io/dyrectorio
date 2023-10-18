package dogger

type LogWriter interface {
	WriteInfo(s string) (n int, err error)
	WriteError(s string) (n int, err error)
}
