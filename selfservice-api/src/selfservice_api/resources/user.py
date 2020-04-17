# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API endpoints for managing an user resource."""

from http import HTTPStatus

from flask import g, jsonify, request
from flask_restplus import Namespace, Resource, cors
from marshmallow import ValidationError

from ..models import OrgWhitelist, User
from ..schemas.user import UserSchema
from ..utils.auth import auth, jwt
from ..utils.util import cors_preflight


API = Namespace('User', description='User')


@cors_preflight('GET,POST,PUT,OPTIONS')
@API.route('', methods=['GET', 'POST', 'PUT', 'OPTIONS'])
class UserResource(Resource):
    """Resource for managing create and get user."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @jwt.requires_auth
    def get():
        """Get user details."""
        token_info = g.jwt_oidc_token_info
        user = User.find_by_oauth_id(token_info.get('sub'))

        verified = False
        provider = token_info.get('provider')
        fields_required = {
            'email': not provider == 'idir',
            'phone': True
        }
        user_dump = None
        if user is not None:
            verified = True
            user_dump = UserSchema().dump(user)
        elif token_info.get('email') is not None:
            # Check again with email id if email is available in token.
            user = User.find_by_email(token_info.get('email'))
            user_dump = UserSchema().dump(user) if user is not None else None

        user_dump = {
            'firstName': token_info.get('given_name'),
            'lastName': token_info.get('family_name')
        } if user_dump is None else user_dump

        return jsonify({
            'verified': verified,
            'fieldsRequired': fields_required,
            'provider': provider,
            'user': user_dump
        }), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @jwt.requires_auth
    def post():
        """Post a new user using the request body."""
        token_info = g.jwt_oidc_token_info
        user_json = request.get_json()

        try:
            user = User.find_by_oauth_id(token_info.get('sub'))
            user_schema = UserSchema()

            provider = token_info.get('provider')
            if provider == 'idir':
                email = token_info.get('email')
            elif provider == 'bcsc':
                email = user_json.get('email')
                domain = email.strip().split('@').pop() if email and '@' in email else None
                valid_domain = OrgWhitelist.validate_domain(domain)
                if not valid_domain:
                    return {'errors': {'email': 'invalidDomain'}}, HTTPStatus.BAD_REQUEST

            dict_data = user_schema.load({
                'email': email,
                'phone': user_json.get('phone'),
                'firstName': token_info.get('given_name'),
                'lastName': token_info.get('family_name'),
                'oauthId': token_info.get('sub')
            })
            if not user:
                # Check again with email id if email is available in token.
                user = User.find_by_email(dict_data['email'])

            if not user:
                user = User.create_from_dict(dict_data)
            else:
                user.update(dict_data)

            response, status = user_schema.dump(user), HTTPStatus.CREATED
        except ValidationError as user_err:
            response, status = {'systemErrors': user_err.messages}, \
                HTTPStatus.BAD_REQUEST
        return response, status

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def put():
        """Update first name and last name from token."""
        token_info = g.jwt_oidc_token_info
        user = g.user
        user.update({
            'first_name': token_info.get('given_name'),
            'last_name': token_info.get('family_name')
        })

        return 'Updated successfully', HTTPStatus.OK
