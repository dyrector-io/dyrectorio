package mapper

func StringMapToByteMap(original map[string]string) map[string][]byte {
	res := map[string][]byte{}

	for key, val := range original {
		res[key] = []byte(val)
	}
	return res
}

func ByteMapToStringMap(original map[string][]byte) map[string]string {
	res := map[string]string{}

	for key, val := range original {
		res[key] = string(val)
	}
	return res
}
