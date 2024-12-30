TARGET_ENV := dev
AWS_PROFILE := create-sf-user-app


# Terraform commands
TF_INIT := terraform init -backend-config=envs/${TARGET_ENV}/backend.tfvars
TF_PLAN := terraform plan -var-file=envs/${TARGET_ENV}/variables.tfvars
TF_APPLY := terraform apply -auto-approve -var-file=envs/${TARGET_ENV}/variables.tfvars
TF_DESTROY := terraform destroy -auto-approve -var-file=envs/${TARGET_ENV}/variables.tfvars

.PHONY: init
init:
	$(TF_INIT)

.PHONY: plan
plan:
	terraform fmt -recursive
	terraform validate
	$(TF_PLAN)

.PHONY: apply
apply:
	terraform fmt -recursive
	terraform validate
	$(TF_APPLY)

.PHONY: destroy
destroy:
	$(TF_DESTROY)