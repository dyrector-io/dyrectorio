package dogger

type LogWriter interface {
	WriteInfo(messages ...string)
	WriteError(messages ...string)
}
