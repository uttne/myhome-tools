{{/*
Expand the name of the chart.
*/}}
{{- define "myhome-tools.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "myhome-tools.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "myhome-tools.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels.
*/}}
{{- define "myhome-tools.labels" -}}
helm.sh/chart: {{ include "myhome-tools.chart" . }}
app.kubernetes.io/name: {{ include "myhome-tools.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels.
*/}}
{{- define "myhome-tools.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myhome-tools.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Service account name.
*/}}
{{- define "myhome-tools.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "myhome-tools.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Backend environment variables. Shared by the backend Deployment and migration Job.
*/}}
{{- define "myhome-tools.backendEnv" -}}
{{- range $name, $value := .Values.backend.env }}
- name: {{ $name }}
  value: {{ $value | quote }}
{{- end }}
{{- with .Values.backend.secretEnv.databaseUrl }}
{{- if .secretName }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ .secretName }}
      key: {{ .secretKey }}
{{- end }}
{{- end }}
{{- with .Values.backend.secretEnv.jwtSecretKey }}
{{- if .secretName }}
- name: JWT_SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: {{ .secretName }}
      key: {{ .secretKey }}
{{- end }}
{{- end }}
{{- with .Values.backend.extraEnv }}
{{- toYaml . }}
{{- end }}
{{- end -}}
